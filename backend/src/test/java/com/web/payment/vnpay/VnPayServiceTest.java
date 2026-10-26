package com.web.payment.vnpay;

import com.web.exception.MessageException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.StringJoiner;
import java.util.TreeMap;

import static org.junit.jupiter.api.Assertions.*;

class VnPayServiceTest {

    private static final String SECRET = "TESTSECRET";

    private VnPayService service;

    @BeforeEach
    void setUp() {
        service = new VnPayService();
        ReflectionTestUtils.setField(service, "payUrl", "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
        ReflectionTestUtils.setField(service, "tmnCode", "TESTCODE");
        ReflectionTestUtils.setField(service, "hashSecret", SECRET);
    }

    @Test
    void hmacSHA512MatchesKnownVector() {
        // RFC 4231 test case 2
        assertEquals("164b7a7bfcf819e2e395fbe73b56e0a387bd64222e831fd610270cd7ea2505549758bf75c05a994a6d034f65f8f0e6fdcaeab1a34d4a6b4b636e070a38bce737",
                VnPayService.hmacSHA512("Jefe", "what do ya want for nothing?"));
    }

    @Test
    void createPaymentUrlContainsSignedParams() {
        String url = service.createPaymentUrl(120000, "123", "thanh toán đơn hàng", "http://localhost:3000/payment", "127.0.0.1");

        assertTrue(url.startsWith("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?"));
        assertTrue(url.contains("vnp_Amount=12000000"));
        assertTrue(url.contains("vnp_TmnCode=TESTCODE"));
        assertTrue(url.contains("vnp_TxnRef=123"));
        assertTrue(url.matches(".*&vnp_SecureHash=[0-9a-f]{128}$"));
    }

    @Test
    void verifyReturnAcceptsCorrectlySignedSuccess() {
        VnPayResult result = service.verifyReturn(signedReturn("00", "00", "12000000"));

        assertTrue(result.isValidSignature());
        assertTrue(result.isSuccess());
        assertEquals("123", result.getTxnRef());
        assertEquals("14000001", result.getTransactionNo());
        assertEquals(120000L, result.getAmount());
    }

    @Test
    void verifyReturnRejectsTamperedAmount() {
        String query = signedReturn("00", "00", "12000000").replace("vnp_Amount=12000000", "vnp_Amount=100");

        assertFalse(service.verifyReturn(query).isValidSignature());
    }

    @Test
    void verifyReturnReportsFailedPayment() {
        VnPayResult result = service.verifyReturn(signedReturn("24", "02", "12000000"));

        assertTrue(result.isValidSignature());
        assertFalse(result.isSuccess());
    }

    @Test
    void verifyReturnRequiresQuery() {
        assertThrows(MessageException.class, () -> service.verifyReturn(null));
        assertThrows(MessageException.class, () -> service.verifyReturn(""));
    }

    @Test
    void notConfiguredThrows() {
        ReflectionTestUtils.setField(service, "hashSecret", "");

        assertThrows(MessageException.class, () -> service.createPaymentUrl(1000, "1", "x", "http://x", "127.0.0.1"));
    }

    // Giả lập query string VNPay redirect về returnUrl
    private static String signedReturn(String responseCode, String transactionStatus, String amount) {
        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Amount", amount);
        params.put("vnp_BankCode", "NCB");
        params.put("vnp_OrderInfo", "thanh toán đơn hàng");
        params.put("vnp_ResponseCode", responseCode);
        params.put("vnp_TmnCode", "TESTCODE");
        params.put("vnp_TransactionNo", "14000001");
        params.put("vnp_TransactionStatus", transactionStatus);
        params.put("vnp_TxnRef", "123");
        StringJoiner joiner = new StringJoiner("&");
        params.forEach((k, v) -> joiner.add(k + "=" + URLEncoder.encode(v, StandardCharsets.US_ASCII)));
        String data = joiner.toString();
        return data + "&vnp_SecureHashType=HmacSHA512&vnp_SecureHash=" + VnPayService.hmacSHA512(SECRET, data);
    }
}
