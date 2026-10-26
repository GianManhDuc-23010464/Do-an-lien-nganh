package com.web.repository;

import com.web.entity.ProductSize;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

public interface ProductSizeRepository extends JpaRepository<ProductSize,Long> {

    @Modifying
    @Transactional
    @Query(value = "delete p from product_size p inner join product_color pc on pc.id = p.product_color_id where pc.product_id = ?1", nativeQuery = true)
    int deleteByProduct(Long productId);

    @Query("select p from ProductSize p where p.productColor.id= ?1")
    public List<ProductSize> findByProductColor(Long colorId);

    /** Khóa dòng tồn kho trong transaction để hai người mua cùng lúc không bán quá số lượng. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from ProductSize p where p.id = ?1")
    Optional<ProductSize> findByIdForUpdate(Long id);

    @Query("select p from ProductSize p where p.quantity <= ?1 order by p.quantity asc")
    List<ProductSize> findLowStock(Integer threshold, Pageable pageable);
}
