package com.web.enums;

/**
 * Trạng thái hiển thị của sản phẩm.
 *
 * Chỉ ACTIVE và HIDDEN được lưu xuống DB (admin tự bật/tắt). OUT_OF_STOCK là
 * trạng thái suy ra lúc đọc: sản phẩm không ẩn nhưng tổng tồn kho = 0. Nhờ vậy
 * trạng thái "hết hàng" luôn đúng theo kho thực tế mà không cần job chạy nền.
 */
public enum ProductStatus {
    ACTIVE,
    HIDDEN,
    OUT_OF_STOCK
}
