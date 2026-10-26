package com.web.service;

import com.web.entity.Invoice;
import com.web.entity.User;
import com.web.enums.PayType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.util.Locale;

/** Gửi mail cho khách khi đặt đơn và khi đơn đổi trạng thái. */
@Service
public class OrderMailService {

    @Autowired
    private MailService mailService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public void sendOrderPlaced(Invoice invoice) {
        String email = emailOf(invoice);
        if (email == null) return;
        String payment = PayType.PAYMENT_DELIVERY.equals(invoice.getPayType())
                ? "Thanh toán khi nhận hàng" : "Đã thanh toán online";
        String body = "<p>Xin chào <b>" + escape(invoice.getReceiverName()) + "</b>,</p>"
                + "<p>Cảm ơn bạn đã đặt hàng! Đơn hàng <b>#" + invoice.getId() + "</b> đã được ghi nhận.</p>"
                + "<table cellpadding='6' style='border-collapse:collapse'>"
                + row("Tổng thanh toán", money(invoice.getPayableAmount()))
                + row("Hình thức", payment)
                + row("Giao đến", escape(invoice.getAddress()))
                + "</table>"
                + "<p><a href='" + frontendUrl + "/orders/" + invoice.getId() + "'>Theo dõi đơn hàng</a></p>";
        mailService.sendEmail(email, "Xác nhận đơn hàng #" + invoice.getId(), wrap(body), false, true);
    }

    public void sendStatusChanged(Invoice invoice) {
        String email = emailOf(invoice);
        if (email == null || invoice.getStatus() == null) return;
        String body = "<p>Xin chào <b>" + escape(invoice.getReceiverName()) + "</b>,</p>"
                + "<p>Đơn hàng <b>#" + invoice.getId() + "</b> của bạn đã chuyển sang trạng thái: "
                + "<b>" + escape(invoice.getStatus().getName()) + "</b>.</p>"
                + "<p><a href='" + frontendUrl + "/orders/" + invoice.getId() + "'>Xem chi tiết đơn hàng</a></p>";
        mailService.sendEmail(email, "Cập nhật đơn hàng #" + invoice.getId(), wrap(body), false, true);
    }

    private static String emailOf(Invoice invoice) {
        User user = invoice.getUser();
        if (user == null && invoice.getUserAddress() != null) user = invoice.getUserAddress().getUser();
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) return null;
        return user.getEmail();
    }

    private static String row(String label, String value) {
        return "<tr><td style='color:#666'>" + label + "</td><td><b>" + value + "</b></td></tr>";
    }

    private static String wrap(String body) {
        return "<div style='font-family:Arial,sans-serif;font-size:14px;color:#222'>" + body
                + "<p style='color:#999;font-size:12px'>Email này được gửi tự động, vui lòng không trả lời.</p></div>";
    }

    private static String money(double value) {
        return NumberFormat.getInstance(new Locale("vi", "VN")).format(Math.round(value)) + " đ";
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
