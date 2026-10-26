package com.web.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.web.enums.PayType;
import lombok.Getter;
import lombok.Setter;
import javax.persistence.*;
import java.sql.Date;
import java.sql.Time;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoice")
@Getter
@Setter
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    private Date createdDate;

    private Time createdTime;

    /** Thời điểm tạo đầy đủ, dùng để tự hủy đơn quá hạn thanh toán. */
    private Timestamp createdAt;

    /** Tổng tiền hàng (đã trừ voucher), chưa gồm phí ship. */
    private Double totalAmount;

    private Double shippingFee;

    /** Số tiền giảm từ voucher. */
    private Double discount;

    /** Đã thu tiền hay chưa (online: khi cổng báo thành công, COD: khi khách nhận hàng). */
    private Boolean paid;

    /** Mã giao dịch gửi sang cổng thanh toán (vnp_TxnRef / orderId MoMo) của lần thanh toán gần nhất. */
    @Column(unique = true)
    private String paymentRef;

    private String receiverName;

    private String phone;

    private String address;

    private String note;

    private PayType payType;

    /** Người đặt (giữ lại kể cả khi địa chỉ bị xóa). */
    @ManyToOne
    @JoinColumn(name = "user_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @ManyToOne
    @JoinColumn(name = "user_address_id")
    private UserAddress userAddress;

    @ManyToOne
    @JoinColumn(name = "status_current")
    private Status status;

    @ManyToOne
    @JoinColumn(name = "voucher_id")
    private Voucher voucher;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.REMOVE)
    @JsonManagedReference
    private List<InvoiceStatus> invoiceStatuses = new ArrayList<>();

    /** Số tiền khách phải trả = tiền hàng + phí ship. */
    @Transient
    public double getPayableAmount() {
        double total = totalAmount == null ? 0 : totalAmount;
        double ship = shippingFee == null ? 0 : shippingFee;
        return total + ship;
    }
}
