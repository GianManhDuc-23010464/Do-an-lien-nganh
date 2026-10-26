package com.web.dto.response;

import com.web.entity.InvoiceStatus;
import com.web.entity.Status;
import com.web.enums.PayType;
import lombok.Getter;
import lombok.Setter;

import java.sql.Date;
import java.sql.Time;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class InvoiceResponse {

    private Long id;

    private Date createdDate;

    private Time createdTime;

    private Double totalAmount;

    private Double shippingFee;

    private Double discount;

    private Double payableAmount;

    private Boolean paid;

    private String receiverName;

    private String phone;

    private String note;

    private String address;

    private PayType payType;

    private UserAdressResponse userAddress;

    private Status status;

    private List<InvoiceStatus> invoiceStatuses = new ArrayList<>();

    /** Các trạng thái admin có thể chuyển sang tiếp theo. */
    private List<Long> nextStatuses = new ArrayList<>();

    /** Khách có thể tự hủy đơn này không. */
    private Boolean cancelable;

    /** Link sang cổng thanh toán (chỉ có khi vừa tạo đơn online hoặc thanh toán lại). */
    private String paymentUrl;
}
