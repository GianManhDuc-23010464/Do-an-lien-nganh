package com.web.dto.request;

import com.web.enums.PayType;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class InvoiceRequest {

    private PayType payType;

    private Long userAddressId;

    private String voucherCode;

    private String note;

    /** Trang frontend mà cổng thanh toán chuyển khách về sau khi trả tiền. */
    private String returnUrl;

    private List<ProductSizeRequest> listProductSize = new ArrayList<>();
}
