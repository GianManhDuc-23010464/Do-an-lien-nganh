package com.web.mapper;

import com.web.dto.response.ProductResponse;
import com.web.entity.Product;
import com.web.entity.ProductColor;
import com.web.entity.ProductSize;
import com.web.enums.ProductStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.modelmapper.ModelMapper;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ProductMapperTest {

    private ProductMapper productMapper;

    @BeforeEach
    void setup() {
        productMapper = new ProductMapper();
        ReflectionTestUtils.setField(productMapper, "mapper", new ModelMapper());
    }

    @Test
    void activeWhenInStock() {
        Product product = product(ProductStatus.ACTIVE, size("M", 5, null));
        ProductResponse response = productMapper.productToProResponse(product);
        assertEquals(ProductStatus.ACTIVE, response.getStatus());
        assertEquals(5, response.getStock());
    }

    @Test
    void outOfStockDerivedWhenStockZero() {
        Product product = product(ProductStatus.ACTIVE, size("M", 0, null));
        ProductResponse response = productMapper.productToProResponse(product);
        assertEquals(ProductStatus.OUT_OF_STOCK, response.getStatus());
        assertEquals(0, response.getStock());
    }

    @Test
    void hiddenKeptEvenWhenInStock() {
        Product product = product(ProductStatus.HIDDEN, size("M", 20, null));
        ProductResponse response = productMapper.productToProResponse(product);
        assertEquals(ProductStatus.HIDDEN, response.getStatus());
    }

    @Test
    void lowStockWhenBelowCustomThreshold() {
        // tồn 2, ngưỡng 3 -> cảnh báo sắp hết
        Product product = product(ProductStatus.ACTIVE, size("M", 2, 3));
        ProductResponse response = productMapper.productToProResponse(product);
        assertTrue(response.getLowStock());
    }

    @Test
    void lowStockUsesDefaultThresholdWhenNull() {
        // tồn 4, không đặt ngưỡng -> mặc định 5 -> vẫn cảnh báo
        Product product = product(ProductStatus.ACTIVE, size("M", 4, null));
        ProductResponse response = productMapper.productToProResponse(product);
        assertTrue(response.getLowStock());
    }

    @Test
    void notLowStockWhenPlenty() {
        Product product = product(ProductStatus.ACTIVE, size("M", 50, null));
        ProductResponse response = productMapper.productToProResponse(product);
        assertEquals(false, response.getLowStock());
    }

    private static Product product(ProductStatus status, ProductSize... sizes) {
        Product product = new Product();
        product.setId(1L);
        product.setName("Áo thun cotton");
        product.setPrice(199000D);
        product.setStatus(status);
        ProductColor color = new ProductColor();
        color.setColorName("Trắng ngà");
        color.setProductSizes(List.of(sizes));
        for (ProductSize s : sizes) {
            s.setProductColor(color);
        }
        product.getProductColors().add(color);
        return product;
    }

    private static ProductSize size(String name, int quantity, Integer threshold) {
        ProductSize size = new ProductSize();
        size.setSizeName(name);
        size.setQuantity(quantity);
        size.setLowStockThreshold(threshold);
        return size;
    }
}
