package com.web.repository;

import com.web.entity.Invoice;
import com.web.enums.PayType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice,Long> {

    @Modifying
    @Transactional
    @Query("update Invoice i set i.userAddress = null where i.userAddress.id = ?1")
    int setNull(Long userAdressId);

    @Modifying
    @Transactional
    @Query("update Invoice i set i.voucher = null where i.voucher.id = ?1")
    int setNullVoucher(Long voucherId);

    @Query("select i from Invoice i left join i.user u left join i.userAddress ua left join ua.user uu where u.id = ?1 or uu.id = ?1 order by i.id desc")
    public List<Invoice> findByUser(Long userId);

    @Query("select i from Invoice i where i.createdDate >= ?1 and i.createdDate <= ?2 order by i.id desc")
    public Page<Invoice> findByDate(Date from, Date to, Pageable pageable);

    @Query("select i from Invoice i where i.createdDate >= ?1 and i.createdDate <= ?2 and i.status.id = ?3 order by i.id desc")
    public Page<Invoice> findByDateAndStatus(Date from, Date to, Long status, Pageable pageable);

    @Query("select i from Invoice i where i.createdDate >= ?1 and i.createdDate <= ?2 and i.payType = ?3 order by i.id desc")
    public Page<Invoice> findByDateAndPaytype(Date from, Date to, PayType payType, Pageable pageable);

    @Query("select i from Invoice i where i.createdDate >= ?1 and i.createdDate <= ?2 and i.payType = ?3 and i.status.id = ?4 order by i.id desc")
    public Page<Invoice> findByDateAndPaytypeAndStatus(Date from, Date to, PayType payType,Long statusId, Pageable pageable);

    Optional<Invoice> findByPaymentRef(String paymentRef);

    @Query("select i from Invoice i where i.status.id = ?1 and i.createdAt < ?2")
    List<Invoice> findByStatusCreatedBefore(Long statusId, Timestamp before);

    @Query("select count(i.id) from Invoice i where i.status.id = ?1")
    Long countByStatus(Long statusId);

    // Doanh thu = tiền hàng của các đơn đã thu tiền (paid = true)
    @Query(value = "select sum(i.total_amount) from invoice i where Month(i.created_date) = ?1 and Year(i.created_date) = ?2 and i.paid = true", nativeQuery = true)
    public Double calDt(Integer month, Integer year);

    @Query(value = "select sum(i.total_amount) from invoice i where i.paid = true and i.created_date = ?1", nativeQuery = true)
    public Double revenueByDate(Date ngay);

    @Query(value = "select count(i.id) from invoice i\n" +
            "inner join invoice_status issn on issn.invoice_id = i.id\n" +
            "where issn.status_id = 4 and issn.created_date = ?1",nativeQuery = true)
    public Double numInvoiceToDay(Date ngay);
}
