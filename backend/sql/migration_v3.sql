-- Nhóm 1: trạng thái sản phẩm, biến thể (SKU/giá riêng/ngưỡng cảnh báo),
-- và người thực hiện mỗi lần đổi trạng thái đơn.
-- Ở profile dev (ddl-auto=update) Hibernate tự thêm cột; chỉ cần chạy file này
-- khi deploy với profile prod (ddl-auto=validate). Chạy sau migration_v2.sql.

-- 1. Trạng thái sản phẩm. Chỉ lưu ACTIVE / HIDDEN; "hết hàng" được suy ra khi tồn kho = 0.
ALTER TABLE product ADD COLUMN status VARCHAR(20) NULL;
UPDATE product SET status = 'ACTIVE' WHERE status IS NULL;

-- 2. Biến thể màu–size: mã SKU, giá riêng (tùy chọn), ngưỡng cảnh báo sắp hết hàng.
ALTER TABLE product_size
    ADD COLUMN sku                 VARCHAR(60) NULL,
    ADD COLUMN price               DOUBLE      NULL,
    ADD COLUMN low_stock_threshold INT         NULL;

-- 3. Lịch sử trạng thái đơn: ghi id và tên người thực hiện (để trống nếu do hệ thống).
ALTER TABLE invoice_status
    ADD COLUMN changed_by      BIGINT       NULL,
    ADD COLUMN changed_by_name VARCHAR(255) NULL;
