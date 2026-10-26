package com.web.service.impl;

import com.web.dto.request.InvoiceRequest;
import com.web.dto.request.PaymentReturnRequest;
import com.web.dto.request.ProductSizeRequest;
import com.web.entity.*;
import com.web.enums.PayType;
import com.web.exception.MessageException;
import com.web.payment.vnpay.VnPayResult;
import com.web.payment.vnpay.VnPayService;
import com.web.repository.*;
import com.web.utils.StatusUtils;
import com.web.utils.UserUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceImplTest {

    @Mock private UserUtils userUtils;
    @Mock private UserAddressRepository userAddressRepository;
    @Mock private InvoiceRepository invoiceRepository;
    @Mock private InvoiceDetailRepository invoiceDetailRepository;
    @Mock private StatusRepository statusRepository;
    @Mock private VnPayService vnPayService;
    @Mock private ProductSizeRepository productSizeRepository;
    @Mock private ProductRepository productRepository;
    @Mock private InvoiceStatusRepository invoiceStatusRepository;
    @Mock private com.web.mapper.InvoiceMapper invoiceMapper;

    @InjectMocks
    private InvoiceServiceImpl invoiceService;

    @Test
    void rejectsNegativeQuantity() {
        // id > 127: trước đây so sánh Long bằng != làm mọi user id lớn bị "access denied"
        when(userUtils.getUserWithAuthority()).thenReturn(user(200L));
        when(userAddressRepository.findById(1L)).thenReturn(Optional.of(address(1L, user(200L))));

        MessageException e = assertThrows(MessageException.class,
                () -> invoiceService.create(request(PayType.PAYMENT_DELIVERY, -3), "127.0.0.1"));
        assertEquals("Số lượng phải lớn hơn 0", e.getDefaultMessage());
    }

    @Test
    void rejectsAddressOfAnotherUser() {
        when(userUtils.getUserWithAuthority()).thenReturn(user(200L));
        when(userAddressRepository.findById(1L)).thenReturn(Optional.of(address(1L, user(300L))));

        MessageException e = assertThrows(MessageException.class,
                () -> invoiceService.create(request(PayType.PAYMENT_DELIVERY, 1), "127.0.0.1"));
        assertEquals("access denied", e.getDefaultMessage());
    }

    @Test
    void paymentReturnRejectsInvalidSignature() {
        VnPayResult result = new VnPayResult();
        result.setValidSignature(false);
        when(vnPayService.verifyReturn("q")).thenReturn(result);
        PaymentReturnRequest req = new PaymentReturnRequest();
        req.setVnpQuery("q");

        MessageException e = assertThrows(MessageException.class, () -> invoiceService.confirmPaymentReturn(req));
        assertEquals("Chữ ký VNPay không hợp lệ", e.getDefaultMessage());
    }

    @Test
    void vnpayIpnRejectsWrongAmount() {
        VnPayResult result = new VnPayResult();
        result.setValidSignature(true);
        result.setSuccess(true);
        result.setTxnRef("HD1T1");
        result.setAmount(1000L);
        when(vnPayService.verifyReturn("q")).thenReturn(result);
        Invoice invoice = new Invoice();
        invoice.setTotalAmount(100000D);
        invoice.setShippingFee(20000D);
        when(invoiceRepository.findByPaymentRef("HD1T1")).thenReturn(Optional.of(invoice));

        Map<String, String> res = invoiceService.handleVnPayIpn("q");
        assertEquals("04", res.get("RspCode"));
    }

    @Test
    void userCancelReturnsStock() {
        User owner = user(500L);
        when(userUtils.getUserWithAuthority()).thenReturn(user(500L));
        Invoice invoice = new Invoice();
        invoice.setId(9L);
        invoice.setUser(owner);
        invoice.setPayType(PayType.PAYMENT_DELIVERY);
        invoice.setPaid(false);
        invoice.setStatus(status(StatusUtils.DANG_CHO_XAC_NHAN));
        when(invoiceRepository.findById(9L)).thenReturn(Optional.of(invoice));
        when(statusRepository.findById(StatusUtils.DA_HUY)).thenReturn(Optional.of(status(StatusUtils.DA_HUY)));

        Product product = new Product();
        product.setQuantitySold(5);
        ProductColor color = new ProductColor();
        color.setProduct(product);
        ProductSize size = new ProductSize();
        size.setProductColor(color);
        size.setQuantity(3);
        InvoiceDetail detail = new InvoiceDetail();
        detail.setProductSize(size);
        detail.setQuantity(2);
        when(invoiceDetailRepository.findByInvoiceId(9L)).thenReturn(List.of(detail));

        invoiceService.cancelInvoice(9L);

        assertEquals(5, size.getQuantity());
        assertEquals(3, product.getQuantitySold());
        assertEquals(StatusUtils.DA_HUY, invoice.getStatus().getId());
    }

    @Test
    void cannotCancelShippedOrder() {
        when(userUtils.getUserWithAuthority()).thenReturn(user(500L));
        Invoice invoice = new Invoice();
        invoice.setUser(user(500L));
        invoice.setStatus(status(StatusUtils.DA_GUI));
        when(invoiceRepository.findById(9L)).thenReturn(Optional.of(invoice));

        assertThrows(MessageException.class, () -> invoiceService.cancelInvoice(9L));
    }

    private static InvoiceRequest request(PayType payType, int quantity) {
        ProductSizeRequest item = new ProductSizeRequest();
        item.setIdProductSize(10L);
        item.setQuantity(quantity);
        InvoiceRequest request = new InvoiceRequest();
        request.setPayType(payType);
        request.setUserAddressId(1L);
        request.setListProductSize(List.of(item));
        return request;
    }

    private static User user(Long id) {
        User u = new User();
        u.setId(Long.valueOf(id.longValue())); // tạo object Long mới, không dùng cache
        return u;
    }

    private static UserAddress address(Long id, User user) {
        UserAddress a = new UserAddress();
        a.setId(id);
        a.setUser(user);
        return a;
    }

    private static Status status(Long id) {
        Status s = new Status();
        s.setId(id);
        s.setName("s" + id);
        return s;
    }
}
