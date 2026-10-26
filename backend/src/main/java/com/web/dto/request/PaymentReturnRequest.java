package com.web.dto.request;

import lombok.Getter;
import lombok.Setter;

/** Dữ liệu trang kết quả thanh toán gửi lên để backend xác minh với cổng. */
@Getter
@Setter
public class PaymentReturnRequest {

    /** Query string VNPay trả về (không có dấu '?'). */
    private String vnpQuery;

    /** orderId / requestId MoMo trả về trên returnUrl. */
    private String orderId;

    private String requestId;
}
