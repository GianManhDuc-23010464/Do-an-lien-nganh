package com.web.service.impl;

import com.web.constants.Constants;
import com.web.dto.request.InvoiceRequest;
import com.web.dto.request.PaymentReturnRequest;
import com.web.dto.request.ProductSizeRequest;
import com.web.dto.request.PushNotificationRequest;
import com.web.dto.response.InvoiceResponse;
import com.web.entity.*;
import com.web.enums.PayType;
import com.web.exception.MessageException;
import com.web.firebase.PushNotificationService;
import com.web.mapper.InvoiceMapper;
import com.web.payment.PaymentGatewayService;
import com.web.payment.vnpay.VnPayResult;
import com.web.payment.vnpay.VnPayService;
import com.web.repository.*;
import com.web.service.InvoiceService;
import com.web.service.OrderMailService;
import com.web.service.VoucherService;
import com.web.utils.CommonPage;
import com.web.utils.StatusUtils;
import com.web.utils.UserUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.sql.Time;
import java.sql.Timestamp;
import java.util.*;

@Component
public class InvoiceServiceImpl implements InvoiceService {

    private static final Logger log = LoggerFactory.getLogger(InvoiceServiceImpl.class);

    @Autowired
    private InvoiceMapper invoiceMapper;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private HistoryPayRepository historyPayRepository;

    @Autowired
    private ProductSizeRepository productSizeRepository;

    @Autowired
    private UserUtils userUtils;

    @Autowired
    private UserAddressRepository userAddressRepository;

    @Autowired
    private StatusRepository statusRepository;

    @Autowired
    private InvoiceDetailRepository invoiceDetailRepository;

    @Autowired
    private InvoiceStatusRepository invoiceStatusRepository;

    @Autowired
    private VoucherService voucherService;

    @Autowired
    private CommonPage commonPage;

    @Autowired
    private PushNotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private VnPayService vnPayService;

    @Autowired
    private PaymentGatewayService paymentGatewayService;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private OrderMailService orderMailService;

    @Value("${app.order.payment-timeout-minutes:30}")
    private int paymentTimeoutMinutes;

    // ------------------------------------------------------------------ tạo đơn

    @Override
    @Transactional
    public InvoiceResponse create(InvoiceRequest request, String clientIp) {
        User user = currentUser();
        if (request.getPayType() == null) {
            throw new MessageException("Vui lòng chọn hình thức thanh toán");
        }
        if (request.getUserAddressId() == null) {
            throw new MessageException("Vui lòng chọn địa chỉ nhận hàng");
        }
        UserAddress userAddress = userAddressRepository.findById(request.getUserAddressId())
                .orElseThrow(() -> new MessageException("Không tìm thấy địa chỉ nhận hàng"));
        if (userAddress.getUser() == null || !Objects.equals(userAddress.getUser().getId(), user.getId())) {
            throw new MessageException("access denied");
        }
        Map<Long, Integer> items = mergeItems(request.getListProductSize());
        boolean online = isOnline(request.getPayType());
        if (online && (request.getReturnUrl() == null || request.getReturnUrl().isBlank())) {
            throw new MessageException("returnUrl require");
        }

        // Khóa tồn kho theo thứ tự id để tránh deadlock, kiểm tra và tính tiền từ giá trong DB
        Map<Long, ProductSize> sizes = new LinkedHashMap<>();
        double subtotal = 0;
        for (Map.Entry<Long, Integer> e : items.entrySet()) {
            ProductSize size = productSizeRepository.findByIdForUpdate(e.getKey())
                    .orElseThrow(() -> new MessageException("Sản phẩm (size " + e.getKey() + ") không tồn tại"));
            if (size.getQuantity() == null || size.getQuantity() < e.getValue()) {
                throw new MessageException(productName(size) + " - size " + size.getSizeName()
                        + " chỉ còn " + (size.getQuantity() == null ? 0 : size.getQuantity()) + " sản phẩm");
            }
            sizes.put(e.getKey(), size);
            subtotal += size.getProductColor().getProduct().getPrice() * e.getValue();
        }

        Invoice invoice = new Invoice();
        long now = System.currentTimeMillis();
        invoice.setCreatedDate(new Date(now));
        invoice.setCreatedTime(new Time(now));
        invoice.setCreatedAt(new Timestamp(now));
        invoice.setUser(user);
        invoice.setUserAddress(userAddress);
        invoice.setNote(request.getNote());
        invoice.setPhone(userAddress.getPhone());
        invoice.setAddress(formatAddress(userAddress));
        invoice.setReceiverName(userAddress.getFullname());
        invoice.setPayType(request.getPayType());
        invoice.setPaid(false);
        invoice.setShippingFee(Constants.SHIPPING_FEE);

        double discount = 0;
        String code = request.getVoucherCode();
        if (code != null && !code.isBlank() && !"null".equals(code)) {
            Optional<Voucher> voucher = voucherService.findByCode(code.trim(), subtotal);
            if (voucher.isPresent()) {
                discount = Math.min(voucher.get().getDiscount(), subtotal);
                invoice.setVoucher(voucher.get());
            }
        }
        invoice.setDiscount(discount);
        invoice.setTotalAmount(subtotal - discount);
        Long firstStatus = online ? StatusUtils.CHO_THANH_TOAN : StatusUtils.DANG_CHO_XAC_NHAN;
        invoice.setStatus(status(firstStatus));
        Invoice result = invoiceRepository.save(invoice);

        // Trừ kho ngay (giữ hàng cho cả đơn đang chờ thanh toán)
        for (Map.Entry<Long, Integer> e : items.entrySet()) {
            ProductSize size = sizes.get(e.getKey());
            InvoiceDetail detail = new InvoiceDetail();
            detail.setInvoice(result);
            detail.setPrice(size.getProductColor().getProduct().getPrice());
            detail.setQuantity(e.getValue());
            detail.setProductSize(size);
            invoiceDetailRepository.save(detail);
            size.setQuantity(size.getQuantity() - e.getValue());
            productSizeRepository.save(size);
            Product product = size.getProductColor().getProduct();
            product.setQuantitySold((product.getQuantitySold() == null ? 0 : product.getQuantitySold()) + e.getValue());
            productRepository.save(product);
            cartItemRepository.deleteByUserIdAndProductSizeId(user.getId(), e.getKey());
        }
        addStatusHistory(result, firstStatus);

        InvoiceResponse response;
        if (online) {
            result.setPaymentRef(PaymentGatewayService.newPaymentRef(result.getId()));
            invoiceRepository.save(result);
            String url = paymentGatewayService.createPaymentUrl(result, request.getReturnUrl(), clientIp);
            response = invoiceMapper.invoiceToInvoiceResponse(result);
            response.setPaymentUrl(url);
        } else {
            response = invoiceMapper.invoiceToInvoiceResponse(result);
            onOrderConfirmed(result);
        }
        return response;
    }

    @Override
    @Transactional
    public InvoiceResponse retryPayment(Long invoiceId, String returnUrl, String clientIp) {
        Invoice invoice = ownInvoice(invoiceId);
        if (!isOnline(invoice.getPayType()) || Boolean.TRUE.equals(invoice.getPaid())
                || !Objects.equals(invoice.getStatus().getId(), StatusUtils.CHO_THANH_TOAN)) {
            throw new MessageException("Đơn hàng này không cần thanh toán");
        }
        if (returnUrl == null || returnUrl.isBlank()) {
            throw new MessageException("returnUrl require");
        }
        invoice.setPaymentRef(PaymentGatewayService.newPaymentRef(invoice.getId()));
        invoiceRepository.save(invoice);
        InvoiceResponse response = invoiceMapper.invoiceToInvoiceResponse(invoice);
        response.setPaymentUrl(paymentGatewayService.createPaymentUrl(invoice, returnUrl, clientIp));
        return response;
    }

    // ------------------------------------------------------------------ xác nhận thanh toán

    @Override
    @Transactional
    public InvoiceResponse confirmPaymentReturn(PaymentReturnRequest request) {
        if (request.getVnpQuery() != null && !request.getVnpQuery().isBlank()) {
            VnPayResult vnp = vnPayService.verifyReturn(request.getVnpQuery());
            if (!vnp.isValidSignature()) {
                throw new MessageException("Chữ ký VNPay không hợp lệ");
            }
            Invoice invoice = invoiceRepository.findByPaymentRef(vnp.getTxnRef())
                    .orElseThrow(() -> new MessageException("Không tìm thấy đơn hàng"));
            checkOwner(invoice);
            if (vnp.isSuccess()) {
                markPaid(invoice, vnp.getTxnRef(), vnp.getTransactionNo(), vnp.getAmount());
            }
            return invoiceMapper.invoiceToInvoiceResponse(invoice);
        }
        if (request.getOrderId() != null && !request.getOrderId().isBlank()) {
            Invoice invoice = invoiceRepository.findByPaymentRef(request.getOrderId())
                    .orElseThrow(() -> new MessageException("Không tìm thấy đơn hàng"));
            checkOwner(invoice);
            String requestId = request.getRequestId() == null ? request.getOrderId() : request.getRequestId();
            Long amount = paymentGatewayService.queryMomoPaidAmount(request.getOrderId(), requestId);
            if (amount != null) {
                markPaid(invoice, request.getOrderId(), requestId, amount);
            }
            return invoiceMapper.invoiceToInvoiceResponse(invoice);
        }
        throw new MessageException("Thiếu thông tin thanh toán");
    }

    @Override
    @Transactional
    public Map<String, String> handleVnPayIpn(String queryString) {
        Map<String, String> res = new HashMap<>();
        try {
            VnPayResult vnp = vnPayService.verifyReturn(queryString);
            if (!vnp.isValidSignature()) {
                return rsp(res, "97", "Invalid Checksum");
            }
            Optional<Invoice> invoice = invoiceRepository.findByPaymentRef(vnp.getTxnRef());
            if (invoice.isEmpty()) {
                return rsp(res, "01", "Order not Found");
            }
            if (vnp.getAmount() == null || vnp.getAmount() != Math.round(invoice.get().getPayableAmount())) {
                return rsp(res, "04", "Invalid Amount");
            }
            if (Boolean.TRUE.equals(invoice.get().getPaid())) {
                return rsp(res, "02", "Order already confirmed");
            }
            if (vnp.isSuccess()) {
                markPaid(invoice.get(), vnp.getTxnRef(), vnp.getTransactionNo(), vnp.getAmount());
            }
            return rsp(res, "00", "Confirm Success");
        } catch (Exception e) {
            log.error("VNPay IPN error", e);
            return rsp(res, "99", "Unknow error");
        }
    }

    @Override
    @Transactional
    public void handleMomoIpn(String orderId, String requestId) {
        if (orderId == null) return;
        invoiceRepository.findByPaymentRef(orderId).ifPresent(invoice -> {
            String reqId = requestId == null ? orderId : requestId;
            Long amount = paymentGatewayService.queryMomoPaidAmount(orderId, reqId);
            if (amount != null) {
                markPaid(invoice, orderId, reqId, amount);
            }
        });
    }

    /** Đánh dấu đơn đã thanh toán. Gọi nhiều lần (return + IPN) vẫn an toàn. */
    private void markPaid(Invoice invoice, String ref, String transactionNo, Long amount) {
        if (Boolean.TRUE.equals(invoice.getPaid())) {
            return;
        }
        if (amount == null || amount != Math.round(invoice.getPayableAmount())) {
            throw new MessageException("Số tiền thanh toán không khớp với đơn hàng");
        }
        if (historyPayRepository.findByOrderIdAndRequestId(ref, transactionNo).isPresent()) {
            return;
        }
        HistoryPay historyPay = new HistoryPay();
        historyPay.setInvoice(invoice);
        historyPay.setOrderId(ref);
        historyPay.setRequestId(transactionNo);
        historyPay.setCreatedDate(new Date(System.currentTimeMillis()));
        historyPay.setCreatedTime(new Time(System.currentTimeMillis()));
        historyPay.setTotalAmount(invoice.getPayableAmount());
        historyPayRepository.save(historyPay);

        invoice.setPaid(true);
        if (Objects.equals(invoice.getStatus().getId(), StatusUtils.CHO_THANH_TOAN)) {
            invoice.setStatus(status(StatusUtils.DANG_CHO_XAC_NHAN));
            invoiceRepository.save(invoice);
            addStatusHistory(invoice, StatusUtils.DANG_CHO_XAC_NHAN);
            onOrderConfirmed(invoice);
        } else {
            // Tiền về sau khi đơn đã bị hủy (quá hạn): giữ trạng thái hủy, để admin hoàn tiền
            String note = invoice.getNote() == null ? "" : invoice.getNote() + " ";
            invoice.setNote(note + "[Đã thanh toán sau khi đơn bị hủy - cần hoàn tiền]");
            invoiceRepository.save(invoice);
        }
    }

    @Override
    @Transactional
    public int expireUnpaidOrders() {
        Timestamp before = new Timestamp(System.currentTimeMillis() - paymentTimeoutMinutes * 60_000L);
        List<Invoice> list = invoiceRepository.findByStatusCreatedBefore(StatusUtils.CHO_THANH_TOAN, before);
        for (Invoice invoice : list) {
            if (Boolean.TRUE.equals(invoice.getPaid())) continue;
            changeStatus(invoice, StatusUtils.DA_HUY);
        }
        return list.size();
    }

    // ------------------------------------------------------------------ trạng thái

    @Override
    @Transactional
    public InvoiceResponse updateStatus(Long invoiceId, Long statusId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new MessageException("invoice id not found"));
        statusRepository.findById(statusId).orElseThrow(() -> new MessageException("status id not found"));
        Long current = invoice.getStatus().getId();
        if (!StatusUtils.canTransition(current, statusId)) {
            throw new MessageException("Không thể chuyển từ \"" + invoice.getStatus().getName() + "\" sang \""
                    + status(statusId).getName() + "\"");
        }
        changeStatus(invoice, statusId);
        orderMailService.sendStatusChanged(invoice);
        return invoiceMapper.invoiceToInvoiceResponse(invoice);
    }

    @Override
    @Transactional
    public InvoiceResponse cancelInvoice(Long invoiceId) {
        Invoice invoice = ownInvoice(invoiceId);
        if (!StatusUtils.userCanCancel(invoice.getStatus().getId())) {
            throw new MessageException("Đơn hàng \"" + invoice.getStatus().getName() + "\" không thể hủy");
        }
        if (Boolean.TRUE.equals(invoice.getPaid())) {
            throw new MessageException("Đơn hàng đã thanh toán, vui lòng liên hệ shop để hủy và hoàn tiền");
        }
        changeStatus(invoice, StatusUtils.DA_HUY);
        return invoiceMapper.invoiceToInvoiceResponse(invoice);
    }

    @Override
    @Transactional
    public InvoiceResponse confirmReceived(Long invoiceId) {
        Invoice invoice = ownInvoice(invoiceId);
        if (!Objects.equals(invoice.getStatus().getId(), StatusUtils.DA_GUI)) {
            throw new MessageException("Chỉ xác nhận được khi đơn đang giao");
        }
        changeStatus(invoice, StatusUtils.DA_NHAN);
        return invoiceMapper.invoiceToInvoiceResponse(invoice);
    }

    /** Đổi trạng thái + ghi lịch sử + hoàn kho / ghi nhận thu tiền COD. */
    private void changeStatus(Invoice invoice, Long statusId) {
        invoice.setStatus(status(statusId));
        if (StatusUtils.returnsStock(statusId)) {
            restock(invoice);
        }
        if (Objects.equals(statusId, StatusUtils.DA_NHAN) && PayType.PAYMENT_DELIVERY.equals(invoice.getPayType())) {
            invoice.setPaid(true);
        }
        invoiceRepository.save(invoice);
        addStatusHistory(invoice, statusId);
    }

    private void restock(Invoice invoice) {
        for (InvoiceDetail detail : invoiceDetailRepository.findByInvoiceId(invoice.getId())) {
            ProductSize size = detail.getProductSize();
            if (size == null) continue;
            size.setQuantity(size.getQuantity() + detail.getQuantity());
            productSizeRepository.save(size);
            Product product = size.getProductColor().getProduct();
            int sold = product.getQuantitySold() == null ? 0 : product.getQuantitySold();
            product.setQuantitySold(Math.max(0, sold - detail.getQuantity()));
            productRepository.save(product);
        }
    }

    // ------------------------------------------------------------------ truy vấn

    @Override
    public List<InvoiceResponse> findByUser() {
        User user = currentUser();
        return invoiceMapper.invoiceListToInvoiceResponseList(invoiceRepository.findByUser(user.getId()));
    }

    @Override
    public Page<InvoiceResponse> findAll(Date from, Date to, Pageable pageable) {
        if (from == null || to == null) {
            from = Date.valueOf("2000-01-01");
            to = Date.valueOf("2200-01-01");
        }
        Page<Invoice> page = invoiceRepository.findByDate(from, to, pageable);
        return commonPage.restPage(page, invoiceMapper.invoiceListToInvoiceResponseList(page.getContent()));
    }

    @Override
    public InvoiceResponse findById(Long invoiceId) {
        return invoiceMapper.invoiceToInvoiceResponse(ownInvoice(invoiceId));
    }

    @Override
    public InvoiceResponse findByIdForAdmin(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new MessageException("invoice id not found"));
        return invoiceMapper.invoiceToInvoiceResponse(invoice);
    }

    @Override
    public Page<InvoiceResponse> findAllFull(Date from, Date to, PayType payType, Long statusId, Pageable pageable) {
        if (from == null || to == null) {
            from = Date.valueOf("2000-01-01");
            to = Date.valueOf("2200-01-01");
        }
        Page<Invoice> page;
        if (payType == null && statusId == null) {
            page = invoiceRepository.findByDate(from, to, pageable);
        } else if (payType == null) {
            page = invoiceRepository.findByDateAndStatus(from, to, statusId, pageable);
        } else if (statusId == null) {
            page = invoiceRepository.findByDateAndPaytype(from, to, payType, pageable);
        } else {
            page = invoiceRepository.findByDateAndPaytypeAndStatus(from, to, payType, statusId, pageable);
        }
        return commonPage.restPage(page, invoiceMapper.invoiceListToInvoiceResponseList(page.getContent()));
    }

    // ------------------------------------------------------------------ tiện ích

    private void onOrderConfirmed(Invoice invoice) {
        orderMailService.sendOrderPlaced(invoice);
        try {
            PushNotificationRequest push = new PushNotificationRequest("Vừa có đơn đặt hàng mới",
                    "Đơn hàng #" + invoice.getId(), "newinvoice", null);
            for (User admin : userRepository.getUserByRole(Constants.ROLE_ADMIN)) {
                if (admin.getTokenFcm() != null && !admin.getTokenFcm().isBlank()) {
                    push.setToken(admin.getTokenFcm());
                    notificationService.sendPushNotificationToToken(push);
                }
            }
        } catch (Exception e) {
            log.warn("Không gửi được thông báo đơn mới: {}", e.getMessage());
        }
    }

    private static Map<Long, Integer> mergeItems(List<ProductSizeRequest> list) {
        if (list == null || list.isEmpty()) {
            throw new MessageException("Giỏ hàng trống");
        }
        Map<Long, Integer> items = new TreeMap<>();
        for (ProductSizeRequest p : list) {
            if (p.getIdProductSize() == null) {
                throw new MessageException("id product size require");
            }
            if (p.getQuantity() == null || p.getQuantity() < 1) {
                throw new MessageException("Số lượng phải lớn hơn 0");
            }
            items.merge(p.getIdProductSize(), p.getQuantity(), Integer::sum);
        }
        return items;
    }

    private static boolean isOnline(PayType payType) {
        return PayType.PAYMENT_MOMO.equals(payType) || PayType.PAYMENT_VNPAY.equals(payType);
    }

    private User currentUser() {
        User user = userUtils.getUserWithAuthority();
        if (user == null) {
            throw new MessageException("Vui lòng đăng nhập");
        }
        return user;
    }

    private Invoice ownInvoice(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new MessageException("invoice id not found"));
        checkOwner(invoice);
        return invoice;
    }

    private void checkOwner(Invoice invoice) {
        User user = currentUser();
        if (!Objects.equals(ownerId(invoice), user.getId())) {
            throw new MessageException("access denied");
        }
    }

    static Long ownerId(Invoice invoice) {
        if (invoice.getUser() != null) return invoice.getUser().getId();
        if (invoice.getUserAddress() != null && invoice.getUserAddress().getUser() != null) {
            return invoice.getUserAddress().getUser().getId();
        }
        return null;
    }

    private Status status(Long id) {
        return statusRepository.findById(id).orElseThrow(() -> new MessageException("status " + id + " not found"));
    }

    private void addStatusHistory(Invoice invoice, Long statusId) {
        InvoiceStatus history = new InvoiceStatus();
        history.setInvoice(invoice);
        history.setCreatedDate(new Date(System.currentTimeMillis()));
        history.setCreatedTime(new Time(System.currentTimeMillis()));
        history.setStatus(status(statusId));
        invoiceStatusRepository.save(history);
        invoice.getInvoiceStatuses().add(history);
    }

    private static String formatAddress(UserAddress a) {
        Wards w = a.getWards();
        return a.getStreetName() + ", " + w.getName() + ", " + w.getDistricts().getName() + ", "
                + w.getDistricts().getProvince().getName();
    }

    private static String productName(ProductSize size) {
        return size.getProductColor().getProduct().getName();
    }

    private static Map<String, String> rsp(Map<String, String> res, String code, String message) {
        res.put("RspCode", code);
        res.put("Message", message);
        return res;
    }
}
