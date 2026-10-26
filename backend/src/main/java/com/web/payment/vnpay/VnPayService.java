package com.web.payment.vnpay;

import com.web.exception.MessageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Tích hợp cổng VNPay (API v2.1.0).
 * Tài liệu: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
 */
@Service
public class VnPayService {

    private static final String VERSION = "2.1.0";
    private static final String SUCCESS_CODE = "00";

    @Value("${vnpay.pay-url}")
    private String payUrl;

    @Value("${vnpay.tmn-code:}")
    private String tmnCode;

    @Value("${vnpay.hash-secret:}")
    private String hashSecret;

    public String createPaymentUrl(long amount, String txnRef, String orderInfo, String returnUrl, String ipAddr) {
        checkConfigured();
        Calendar now = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat format = new SimpleDateFormat("yyyyMMddHHmmss");
        format.setTimeZone(now.getTimeZone());
        String createDate = format.format(now.getTime());
        now.add(Calendar.MINUTE, 15);
        String expireDate = format.format(now.getTime());

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", VERSION);
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", tmnCode);
        params.put("vnp_Amount", String.valueOf(amount * 100));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", orderInfo);
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_IpAddr", ipAddr);
        params.put("vnp_CreateDate", createDate);
        params.put("vnp_ExpireDate", expireDate);

        String query = buildQuery(params, true);
        String hashData = buildQuery(params, false);
        return payUrl + "?" + query + "&vnp_SecureHash=" + hmacSHA512(hashSecret, hashData);
    }

    /**
     * Kiểm tra query string VNPay trả về qua returnUrl (không có dấu '?').
     */
    public VnPayResult verifyReturn(String queryString) {
        checkConfigured();
        if (queryString == null || queryString.isBlank()) {
            throw new MessageException("Thiếu thông tin thanh toán VNPay");
        }
        Map<String, String> params = new TreeMap<>();
        for (String pair : queryString.split("&")) {
            int idx = pair.indexOf('=');
            if (idx <= 0) continue;
            String key = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8);
            String value = URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8);
            if (key.startsWith("vnp_") && !value.isEmpty()) {
                params.put(key, value);
            }
        }
        String secureHash = params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        VnPayResult result = new VnPayResult();
        result.setValidSignature(secureHash != null && secureHash.equalsIgnoreCase(hmacSHA512(hashSecret, buildQuery(params, false))));
        result.setSuccess(SUCCESS_CODE.equals(params.get("vnp_ResponseCode")) && SUCCESS_CODE.equals(params.get("vnp_TransactionStatus")));
        result.setTxnRef(params.get("vnp_TxnRef"));
        result.setTransactionNo(params.get("vnp_TransactionNo"));
        String amount = params.get("vnp_Amount");
        result.setAmount(amount == null ? null : Long.parseLong(amount) / 100);
        return result;
    }

    private void checkConfigured() {
        if (tmnCode == null || tmnCode.isBlank() || hashSecret == null || hashSecret.isBlank()) {
            throw new MessageException("VNPay chưa được cấu hình (vnpay.tmn-code, vnpay.hash-secret)");
        }
    }

    // VNPay ký trên chuỗi key=value đã sắp xếp theo key, value được URL-encode (US-ASCII)
    private static String buildQuery(Map<String, String> sortedParams, boolean encodeKey) {
        StringJoiner joiner = new StringJoiner("&");
        for (Map.Entry<String, String> e : sortedParams.entrySet()) {
            if (e.getValue() == null || e.getValue().isEmpty()) continue;
            String key = encodeKey ? URLEncoder.encode(e.getKey(), StandardCharsets.US_ASCII) : e.getKey();
            joiner.add(key + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.US_ASCII));
        }
        return joiner.toString();
    }

    static String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(bytes.length * 2);
            for (byte b : bytes) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Không tạo được chữ ký VNPay", e);
        }
    }
}
