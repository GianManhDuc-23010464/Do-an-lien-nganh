package com.web.repository;

import com.web.entity.Category;
import com.web.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product,Long> {

    @Query("select p from Product p where p.name = ?1")
    public Optional<Product> findByName(String name);

    @Query("select p from Product p where p.id = ?1")
    public Optional<Product> findById(Long id);

    @Query("select p from Product p where p.alias = ?1")
    public Optional<Product> findByAlias(String alias);

    @Query("select p from Product p")
    public Page<Product> findAll(Pageable pageable);

    @Query("select p from Product p where p.name like ?1")
    public Page<Product> findAllByParam(String param, Pageable pageable);

    @Query("select distinct p from Product p inner join p.productCategories pc where pc.category.id = ?1")
    public Page<Product> findByCategory(Long category, Pageable pageable);
}
