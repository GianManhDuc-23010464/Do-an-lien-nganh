-- Nâng cấp database cũ lên phiên bản có luồng "đặt hàng trước - thanh toán sau".
-- Ở profile dev (ddl-auto=update) Hibernate tự thêm cột và DataInitializer tự điền dữ liệu,
-- chỉ cần chạy file này khi deploy với profile prod (ddl-auto=validate).

ALTER TABLE invoice
    ADD COLUMN created_at   DATETIME NULL,
    ADD COLUMN shipping_fee DOUBLE   NULL,
    ADD COLUMN discount     DOUBLE   NULL,
    ADD COLUMN paid         BIT(1)   NULL,
    ADD COLUMN payment_ref  VARCHAR(255) NULL,
    ADD COLUMN user_id      BIGINT   NULL,
    ADD CONSTRAINT uk_invoice_payment_ref UNIQUE (payment_ref),
    ADD CONSTRAINT fk_invoice_user FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE product ADD COLUMN old_price DOUBLE NULL;

INSERT INTO statuses (id, name)
SELECT 7, 'Chờ thanh toán' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM statuses WHERE id = 7);

UPDATE invoice SET paid = CASE WHEN pay_type IN (0, 2) OR status_current = 4 THEN 1 ELSE 0 END WHERE paid IS NULL;
UPDATE invoice i JOIN user_address ua ON ua.id = i.user_address_id SET i.user_id = ua.user_id WHERE i.user_id IS NULL;
UPDATE invoice SET shipping_fee = 0 WHERE shipping_fee IS NULL;
UPDATE invoice SET discount = 0 WHERE discount IS NULL;
