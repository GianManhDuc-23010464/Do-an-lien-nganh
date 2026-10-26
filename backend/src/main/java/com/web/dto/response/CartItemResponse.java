package com.web.dto.response;

import com.web.entity.ProductColor;
import com.web.entity.ProductSize;
import lombok.Getter;
import lombok.Setter;

/**
 * Giữ đúng hình dạng {product, color, size, quantity} mà frontend đang dùng cho giỏ hàng.
 */
@Getter
@Setter
public class CartItemResponse {
    private ProductResponse product;
    private ProductColor color;
    private ProductSize size;
    private Integer quantity;
}
