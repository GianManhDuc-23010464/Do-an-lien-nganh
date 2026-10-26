package com.web.payment.vnpay;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VnPayResult {
    private boolean validSignature;
    private boolean success;
    private String txnRef;
    private String transactionNo;
    private Long amount;
}
