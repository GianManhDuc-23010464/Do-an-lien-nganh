package com.web.repository;

import com.web.entity.InvoiceDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface InvoiceDetailRepository extends JpaRepository<InvoiceDetail,Long> {

    @Query("select i from InvoiceDetail i where i.invoice.id = ?1")
    public List<InvoiceDetail> findByInvoiceId(Long invoiceId);

    @Query("select count(i.id) from InvoiceDetail i where i.productSize.productColor.product.id = ?1")
    public Long countByProduct(Long idProduct);

    @Query("select count(i.id) from InvoiceDetail i where i.productSize.productColor.id = ?1")
    public Long countByProductColor(Long idProductColor);

    @Query("select count(i.id) from InvoiceDetail i where i.productSize.id = ?1")
    public Long countByProductSize(Long idProductSize);

    /** Số lần người dùng đã nhận được sản phẩm này (dùng để cho phép đánh giá). */
    @Query("select count(d.id) from InvoiceDetail d join d.invoice i left join i.user u left join i.userAddress ua left join ua.user uu " +
            "where (u.id = ?1 or uu.id = ?1) and d.productSize.productColor.product.id = ?2 and i.status.id = ?3")
    Long countReceivedByUserAndProduct(Long userId, Long productId, Long receivedStatusId);
}
