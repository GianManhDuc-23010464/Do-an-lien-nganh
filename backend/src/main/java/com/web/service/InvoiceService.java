package com.web.service;

import com.web.dto.request.InvoiceRequest;
import com.web.dto.request.PaymentReturnRequest;
import com.web.dto.response.InvoiceResponse;
import com.web.enums.PayType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.sql.Date;
import java.util.List;
import java.util.Map;

public interface InvoiceService {

    /** Tạo đơn. Với MoMo/VNPay đơn ở trạng thái "Chờ thanh toán" và response có paymentUrl. */
    InvoiceResponse create(InvoiceRequest invoiceRequest, String clientIp);

    /** Tạo lại link thanh toán cho đơn online chưa trả tiền. */
    InvoiceResponse retryPayment(Long invoiceId, String returnUrl, String clientIp);

    /** Trang kết quả thanh toán gọi lên để xác minh giao dịch với cổng. */
    InvoiceResponse confirmPaymentReturn(PaymentReturnRequest request);

    /** IPN VNPay: trả về {RspCode, Message} theo đặc tả VNPay. */
    Map<String, String> handleVnPayIpn(String queryString);

    /** IPN MoMo: chỉ dùng orderId/requestId rồi tự hỏi lại MoMo, không tin nội dung body. */
    void handleMomoIpn(String orderId, String requestId);

    /** Hủy các đơn online quá hạn thanh toán và trả hàng về kho. */
    int expireUnpaidOrders();

    InvoiceResponse updateStatus(Long invoiceId, Long statusId);

    List<InvoiceResponse> findByUser();

    Page<InvoiceResponse> findAll(Date from, Date to, Pageable pageable);

    InvoiceResponse cancelInvoice(Long invoiceId);

    /** Khách bấm "Đã nhận được hàng" (chỉ khi đơn đang giao). */
    InvoiceResponse confirmReceived(Long invoiceId);

    InvoiceResponse findById(Long invoiceId);

    InvoiceResponse findByIdForAdmin(Long invoiceId);

    Page<InvoiceResponse> findAllFull(Date from, Date to, PayType payType, Long statusId, Pageable pageable);
}
