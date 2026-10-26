# Prompt: Bổ sung chức năng cơ bản + dữ liệu mẫu thật

Dùng skill **senior-fullstack** (backend + frontend) và giữ hệ thiết kế trong `PROMPT-redesign.md` cho mọi màn hình mới.
Làm trên branch `features` (tách từ `redesign` nếu đã có).

## Bối cảnh
- Backend Spring Boot 2.7 / Java 17 / MySQL, frontend React + Vite + Tailwind 4. Đọc `README.md`, `backend/sql/project_sell.sql`, `backend/sql/migration_v2.sql`, các entity trong `com.web.entity` và `frontend/src` trước khi làm.
- Đã có: sản phẩm có màu → size → tồn kho, danh mục 2 cấp, giỏ hàng, đặt hàng COD/MoMo/VNPay, voucher giảm theo số tiền, đánh giá có ảnh, nhập hàng, banner, blog, thống kê, email + push khi đổi trạng thái.
- Lần này **được phép sửa backend**, với điều kiện:
  - Mọi thay đổi bảng/cột phải có file migration mới `backend/sql/migration_v3.sql` (vì profile prod dùng `ddl-auto=validate`).
  - Giữ tương thích API cũ. Endpoint mới theo quy ước phân quyền `/public/`, `/user/`, `/admin/`.
  - Viết test JUnit cho logic nghiệp vụ mới (tính tiền, voucher, trả hàng, tồn kho).

## A. Chức năng cần bổ sung

### Ưu tiên 1 – cốt lõi (làm trước)
1. **Trạng thái sản phẩm:** Đang bán / Ẩn / Hết hàng (tự chuyển khi tổng tồn kho = 0). Khách không thấy sản phẩm ẩn.
2. **SKU và giá theo biến thể:** mỗi cặp màu–size có mã SKU, giá riêng (tùy chọn, mặc định lấy giá sản phẩm) và ngưỡng cảnh báo sắp hết hàng.
3. **Voucher đầy đủ hơn:** loại giảm số tiền / giảm % (có mức giảm tối đa) / miễn phí vận chuyển; tổng lượt dùng, số lượt mỗi khách; áp dụng toàn shop hoặc theo danh mục. Trang thanh toán hiện voucher dùng được và chưa đủ điều kiện kèm lý do.
4. **Phí vận chuyển:** cấu hình theo vùng (nội thành / ngoại thành / tỉnh khác, dựa trên tỉnh/huyện đã có) và ngưỡng miễn phí vận chuyển. Admin chỉnh trong "Cài đặt vận chuyển".
5. **Hủy đơn có lý do:** khách hoặc shop hủy phải chọn lý do (danh sách cố định + "Khác"). Lý do hiện ở chi tiết đơn và trang quản lý đơn.
6. **Trả hàng / hoàn tiền:** trong 7 ngày sau "Đã nhận", khách gửi yêu cầu (chọn sản phẩm, lý do, ảnh minh chứng). Admin có tab "Trả hàng/Hoàn tiền": Chấp nhận / Từ chối (ghi lý do) → Đã nhận hàng trả → Đã hoàn tiền. Hàng trả được cộng lại kho khi admin xác nhận đã nhận. Chỉ ghi nhận trạng thái hoàn tiền, không gọi API hoàn tiền thật của MoMo/VNPay.
7. **Lịch sử trạng thái đơn:** lưu thời điểm và người thực hiện mỗi lần đổi trạng thái để hiện timeline chính xác.
8. **In phiếu giao hàng:** admin chọn nhiều đơn → in phiếu (mã đơn, người nhận, địa chỉ, SĐT, danh sách hàng, tiền thu hộ COD) bằng trang in CSS `@media print`.

### Ưu tiên 2 – vận hành kiểu kênh người bán
9. **Danh sách cần làm ở Tổng quan:** đếm Chờ xác nhận, Chờ lấy hàng, Đang giao, Yêu cầu trả hàng, Sản phẩm sắp hết / hết hàng, Đánh giá chưa phản hồi. Mỗi ô bấm vào đi tới đúng danh sách đã lọc.
10. **Chương trình khuyến mãi của shop:** giảm giá theo khung thời gian cho một nhóm sản phẩm (giá gạch ngang + badge % trên thẻ sản phẩm), tự bật/tắt theo lịch. Có lịch chạy cho Flash Sale theo khung giờ, số lượng giới hạn, thanh tiến độ "đã bán x/y".
11. **Phản hồi đánh giá:** admin trả lời đánh giá. Lọc đánh giá theo số sao, có ảnh, chưa phản hồi. Ẩn được đánh giá vi phạm.
12. **Báo cáo:** doanh thu, số đơn, giá trị đơn trung bình, top sản phẩm bán chạy, tỷ lệ hủy, theo ngày/tuần/tháng; xuất CSV.
13. **Nhân viên & phân quyền:** thêm vai trò `ROLE_STAFF` chỉ xử lý đơn và trả hàng, không xem doanh thu, không sửa giá. Có nhật ký thao tác admin (ai, làm gì, lúc nào).
14. **Thông báo trong trang admin:** chuông có đơn mới, yêu cầu trả hàng mới, hàng sắp hết (polling 30 giây là đủ).

### Ưu tiên 3 – trải nghiệm khách hàng
15. **Yêu thích** (trái tim trên thẻ sản phẩm, trang "Đã thích").
16. **Tìm kiếm có gợi ý** khi gõ + lịch sử tìm kiếm gần đây, lọc theo giá/size/màu/đánh giá.
17. **Sản phẩm đã xem gần đây** và **sản phẩm tương tự** (cùng danh mục) ở trang chi tiết.
18. **Bảng size** theo danh mục (hiện trong modal ở trang chi tiết).
19. **Mua lại** từ đơn cũ (thêm lại toàn bộ vào giỏ, báo món nào hết hàng).

Với mỗi chức năng: thiết kế bảng/cột → entity + repository + service + API → giao diện khách và admin → test. Làm xong nhóm nào thì dừng cho tôi xem rồi mới làm nhóm tiếp theo.

## B. Cơ sở dữ liệu và dữ liệu mẫu

### Cách tạo
- Viết `backend/sql/seed_demo.sql` (chạy sau `project_sell.sql` + các migration), chèn dữ liệu mới bằng ID không trùng dữ liệu cũ. Thêm hướng dẫn chạy vào `README.md`.
- Hoặc làm `DemoDataSeeder` chỉ chạy ở profile `dev` khi bật cờ `app.seed-demo=true`. Không bao giờ chạy ở `prod`.

### Nội dung (phong cách tối giản, chất liệu tự nhiên, khớp danh mục Nam / Nữ / Trẻ em / Đồng phục đã có)
- **Danh mục:** giữ danh mục cũ, bổ sung danh mục con hợp phong cách như Áo sơ mi linen, Áo thun cotton hữu cơ, Quần ống rộng, Áo khoác nhẹ, Đồ mặc nhà, Phụ kiện (túi vải, mũ, tất).
- **Sản phẩm:** khoảng **40 sản phẩm** trải đều các danh mục. Mỗi sản phẩm có:
  - Tên tiếng Việt tự nhiên (ví dụ "Áo sơ mi linen cổ đứng").
  - Mã sản phẩm, alias không dấu.
  - Mô tả 80–150 từ do bạn tự viết (chất liệu, form dáng, cách giặt).
  - 2–4 màu trung tính (trắng ngà, be, xám tro, xanh rêu, nâu đất, xanh navy). Size S–XL (trẻ em theo tuổi). Tồn kho ngẫu nhiên hợp lý, vài biến thể hết hàng hoặc sắp hết để test cảnh báo.
  - Giá thực tế thị trường Việt Nam (thun 199k–349k, sơ mi linen 449k–699k, quần 399k–599k, áo khoác 599k–999k). Một số có giá cũ để hiện giảm giá.
- **Người dùng:** 1 admin, 1 staff, 15 khách hàng tên Việt Nam giả lập, địa chỉ dùng tỉnh/huyện/xã có sẵn. Mật khẩu mã hóa BCrypt đúng như hệ thống đang dùng. In tài khoản demo ra README.
- **Đơn hàng:** khoảng 80 đơn rải trong 90 ngày gần đây, đủ mọi trạng thái và phương thức thanh toán, có vài đơn hủy (có lý do) và 3–4 yêu cầu trả hàng, để biểu đồ và "Danh sách cần làm" có số liệu.
- **Đánh giá:** 60–100 đánh giá 3–5 sao viết tự nhiên, chỉ cho đơn đã nhận. Vài đánh giá đã được shop phản hồi.
- **Voucher, banner, khuyến mãi, bài blog:** mỗi loại 3–5 mục hợp lệ, có cái còn hạn, có cái đã hết hạn.
- Tất cả tên, mô tả, đánh giá đều là **dữ liệu mẫu tự viết**, không sao chép từ website khác và không nhắc tên thương hiệu có thật.

### Hình ảnh thật
- Chỉ lấy ảnh từ nguồn **cho phép dùng miễn phí cho mục đích thương mại**: Unsplash (Unsplash API) hoặc Pexels (Pexels API). Hỏi tôi API key (đăng ký miễn phí) trước khi tải. **Không** lấy ảnh từ website của các hãng thời trang hay sàn TMĐT.
- Tìm ảnh khớp với **từng sản phẩm và màu** (ví dụ "beige linen shirt flat lay"). Mở xem ảnh đã tải để kiểm tra đúng loại sản phẩm, đúng màu, không có logo hay chữ thương hiệu lộ rõ. Ảnh không khớp thì tìm ảnh khác.
- Ưu tiên ảnh nền sáng, trung tính cho đồng bộ phong cách. Mỗi sản phẩm cần 1 ảnh đại diện + 2–3 ảnh phụ. Ảnh màu (`product_color.link_image`) phải đúng màu đó. Nếu không tìm được ảnh đúng màu, ghi rõ trong báo cáo, không dùng ảnh sai màu.
- Resize về tối đa 1200px, nén WebP. Upload lên Cloudinary bằng cấu hình đã có (`config/` Cloudinary). Nếu tôi chưa có key Cloudinary thì để trong `frontend/public/images/demo/`. Lưu URL vào DB.
- Tạo `backend/sql/IMAGE_CREDITS.md` ghi nguồn, tác giả và link gốc của từng ảnh.

## C. Cách làm việc
1. Đọc code, rồi gửi tôi: danh sách thay đổi DB (bảng/cột mới), danh sách API mới và thứ tự làm. **Chờ tôi duyệt.**
2. Làm theo thứ tự: Ưu tiên 1 → dữ liệu mẫu → Ưu tiên 2 → Ưu tiên 3. Hết mỗi bước thì dừng, tóm tắt, chạy `./mvnw test` + `npm run build` + `npm test`, commit.
3. Không commit file bí mật (`application-local.properties`, `environment.properties`, `firebase-service-account.json`, API key ảnh). Key đặt trong file đã có trong `.gitignore` hoặc biến môi trường.
4. Chỗ nào chưa rõ thì hỏi tôi, không tự đoán.
