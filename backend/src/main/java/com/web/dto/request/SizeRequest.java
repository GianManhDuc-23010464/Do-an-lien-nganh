package com.web.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SizeRequest {

    private Long id;

    private String sizeName;

    private Integer quantity;

    /** Mã SKU của biến thể (tùy chọn). */
    private String sku;

    /** Giá riêng của biến thể; để trống sẽ dùng giá sản phẩm. */
    private Double price;

    /** Ngưỡng cảnh báo sắp hết hàng (tùy chọn). */
    private Integer lowStockThreshold;
}
