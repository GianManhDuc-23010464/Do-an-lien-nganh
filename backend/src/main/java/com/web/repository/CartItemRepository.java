package com.web.repository;

import com.web.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    @Query("select c from CartItem c where c.user.id = ?1 order by c.id")
    List<CartItem> findByUserId(Long userId);

    @Query("select c from CartItem c where c.user.id = ?1 and c.productSize.id = ?2")
    Optional<CartItem> findByUserIdAndProductSizeId(Long userId, Long productSizeId);

    @Query("select count(c.id) from CartItem c where c.user.id = ?1")
    Long countByUserId(Long userId);

    @Modifying
    @Transactional
    @Query("delete from CartItem c where c.user.id = ?1")
    void deleteByUserId(Long userId);

    @Modifying
    @Transactional
    @Query("delete from CartItem c where c.user.id = ?1 and c.productSize.id = ?2")
    void deleteByUserIdAndProductSizeId(Long userId, Long productSizeId);
}
