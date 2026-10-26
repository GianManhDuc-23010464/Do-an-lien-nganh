package com.web.payment;

import com.web.entity.Invoice;
import com.web.enums.PayType;
import com.web.exception.MessageException;
import com.web.payment.momo.config.Environment;
import com.web.payment.momo.constant.RequestType;
import com.web.payment.momo.model.PaymentResponse;
import com.web.payment.momo.model.QueryStatusTransactionResponse;
import com.web.payment.momo.processor.CreateOrderMoMo;
import com.web.payment.momo.processor.QueryTransactionStatus;
import com.web.payment.vnpay.VnPayService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Tạo link thanh toán cho một đơn hàng và hỏi lại cổng (MoMo) xem giao dịch đã thành công chưa.
 * Số tiền luôn lấy từ đơn hàng đã lưu trong DB, không tin dữ liệu frontend gửi lên.
 */
@Service
public class PaymentGatewayService {

    private static final Logger log = LoggerFactory.getLogger(PaymentGatewayService.class);

    @Autowired
    private VnPayService vnPayService;

    /** dev | prod — chọn bộ key trong environment.properties */
    @Value("${momo.env:dev}")
    private String momoEnv;

    /** Địa chỉ public của backend, MoMo gọi IPN về đây. */
    @Value("${app.backend-url:http://localhost:8080}")
    private String backendUrl;

    public static String newPaymentRef(Long invoiceId) {
        return "HD" + invoiceId + "T" + System.currentTimeMillis();
    }

    public String createPaymentUrl(Invoice invoice, String returnUrl, String clientIp) {
        long amount = Math.round(invoice.getPayableAmount());
        String info = "Thanh toan don hang " + invoice.getId();
        if (PayType.PAYMENT_VNPAY.equals(invoice.getPayType())) {
            return vnPayService.createPaymentUrl(amount, invoice.getPaymentRef(), info, returnUrl, clientIp);
        }
        if (PayType.PAYMENT_MOMO.equals(invoice.getPayType())) {
            try {
                PaymentResponse response = CreateOrderMoMo.process(momoEnvironment(), invoice.getPaymentRef(), invoice.getPaymentRef(),
                        Long.toString(amount), info, returnUrl, backendUrl + "/api/payment/public/momo-ipn", "",
                        RequestType.CAPTURE_WALLET, null);
                if (response == null || response.getPayUrl() == null) {
                    throw new MessageException("Không tạo được link thanh toán MoMo"
                            + (response != null && response.getMessage() != null ? ": " + response.getMessage() : ""));
                }
                return response.getPayUrl();
            } catch (MessageException e) {
                throw e;
            } catch (Exception e) {
                log.error("MoMo create order failed", e);
                throw new MessageException("Không kết nối được MoMo, vui lòng thử lại");
            }
        }
        throw new MessageException("Đơn hàng không thanh toán online");
    }

    /** Hỏi MoMo trạng thái giao dịch; trả về số tiền đã thanh toán, hoặc null nếu chưa thành công. */
    public Long queryMomoPaidAmount(String orderId, String requestId) {
        try {
            QueryStatusTransactionResponse response = QueryTransactionStatus.process(momoEnvironment(), orderId, requestId);
            if (response != null && Integer.valueOf(0).equals(response.getResultCode())) {
                return response.getAmount();
            }
            return null;
        } catch (Exception e) {
            log.error("MoMo query failed", e);
            return null;
        }
    }

    private Environment momoEnvironment() {
        return Environment.selectEnv(momoEnv);
    }
}
