package com.web.api;

import com.web.service.InvoiceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * Cổng thanh toán gọi trực tiếp về server (IPN) — không cần đăng nhập.
 * Đơn vẫn được xác nhận dù khách tắt trình duyệt trước khi về trang kết quả.
 *
 * VNPay: khai báo URL IPN  {backend}/api/payment/public/vnpay-ipn  trong trang quản trị merchant.
 * MoMo:  notifyUrl được gửi kèm mỗi giao dịch ({app.backend-url}/api/payment/public/momo-ipn).
 * Khi chạy local, dùng ngrok để cổng gọi được về máy.
 */
@RestController
@RequestMapping("/api/payment/public")
public class PaymentApi {

    private static final Logger log = LoggerFactory.getLogger(PaymentApi.class);

    @Autowired
    private InvoiceService invoiceService;

    @GetMapping("/vnpay-ipn")
    public Map<String, String> vnpayIpn(HttpServletRequest request) {
        return invoiceService.handleVnPayIpn(request.getQueryString());
    }

    @PostMapping("/momo-ipn")
    public ResponseEntity<Void> momoIpn(@RequestBody Map<String, Object> body) {
        try {
            Object orderId = body.get("orderId");
            Object requestId = body.get("requestId");
            invoiceService.handleMomoIpn(orderId == null ? null : orderId.toString(),
                    requestId == null ? null : requestId.toString());
        } catch (Exception e) {
            log.error("MoMo IPN error", e);
        }
        return ResponseEntity.noContent().build();
    }
}
