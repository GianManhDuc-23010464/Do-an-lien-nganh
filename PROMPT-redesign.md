# Prompt: Làm lại giao diện (phong cách tối giản Nhật, đặt hàng kiểu sàn TMĐT, admin kiểu kênh người bán)

Dùng các skill **ui-ux-pro-max**, **frontend-design** và **senior-fullstack** cho việc này.

## Bối cảnh dự án
- Frontend: `frontend/` (React 18 + Vite + Tailwind CSS 4, icon lucide-react, toast sonner, chart.js). Đọc `README.md` và toàn bộ `frontend/src` trước khi sửa.
- Backend: `backend/` (Spring Boot). **KHÔNG sửa backend** trừ khi tôi đồng ý. Giữ nguyên mọi API trong `src/lib/api.js`, luồng JWT, giỏ hàng, MoMo/VNPay/COD và các trạng thái đơn hàng hiện có.
- `frontend-legacy/` chỉ để tham khảo, không đụng vào.
- Làm trên một git branch mới tên `redesign`.

## Nguyên tắc thương hiệu (bắt buộc)
- Chỉ học **UI/UX** (cách bố cục, nhịp khoảng trắng, cách sắp xếp thông tin, luồng thao tác). **Không** dùng tên, logo, wordmark, slogan, hình ảnh, ảnh sản phẩm, icon riêng, nội dung chữ hay màu nhận diện đặc trưng của MUJI hoặc Shopee.
- Thương hiệu là của tôi: giữ logo/tên hiện có trong `components/shop/Logo.jsx`. Không viết chữ "MUJI", "Shopee" ở bất kỳ đâu trong code, comment, alt text hay tên file.
- Ảnh minh họa dùng ảnh placeholder trung tính hoặc ảnh sản phẩm có sẵn trong dữ liệu.

## Phần 1: Giao diện cửa hàng, phong cách tối giản kiểu Nhật
Tinh thần: "không thương hiệu", tĩnh, mộc, tự nhiên. Sản phẩm là nhân vật chính, giao diện lùi về sau.
- **Màu:** nền trắng ngà/giấy (#F7F5F0 hoặc tương tự), chữ xám than đậm (không đen tuyền), viền mảnh xám nhạt, **một** màu nhấn trầm duy nhất (ví dụ đỏ gạch nhạt hoặc nâu gỗ) chỉ dùng cho giá giảm, nút chính và badge. Không gradient, không bóng đổ đậm, không màu neon.
- **Chữ:** sans-serif gọn, hỗ trợ tiếng Việt tốt (giữ Be Vietnam Pro hoặc đề xuất cặp font khác). Cỡ chữ nhỏ, nhiều khoảng thở, chữ hoa giãn cách cho nhãn danh mục. Phân cấp bằng cỡ chữ và độ đậm, không bằng màu.
- **Bố cục:** lưới sản phẩm thoáng, ảnh vuông nền sáng, tên và giá đặt dưới ảnh bằng chữ nhỏ, không khung thẻ nặng nề. Bo góc rất nhỏ hoặc vuông. Nhiều khoảng trắng giữa các khối.
- **Header:** mỏng, logo bên trái, menu danh mục dạng chữ, ô tìm kiếm tối giản, icon tài khoản và giỏ hàng có số lượng. Có mega menu danh mục đơn giản khi hover (desktop) và drawer (mobile).
- **Trang chủ:** banner lớn tĩnh (dùng `Banners` từ API), lưới danh mục dạng ô ảnh có nhãn, các khối "Hàng mới về", "Bán chạy", đoạn giới thiệu triết lý thương hiệu ngắn (viết nội dung mới, nguyên bản của tôi).
- **Danh sách sản phẩm:** bộ lọc cột trái (danh mục, khoảng giá, size, màu) dạng chữ và checkbox mảnh. Sắp xếp ở góc phải. Phân trang giữ logic hiện có.
- **Chi tiết sản phẩm:** gallery ảnh lớn bên trái. Bên phải là tên, giá, chọn biến thể (màu, size) bằng ô chữ viền mảnh, số lượng, nút thêm vào giỏ / mua ngay. Bên dưới có tab mô tả, chất liệu, đánh giá. Tận dụng `VariantSheet.jsx` trên mobile.
- **Chuyển động:** tối thiểu, chỉ fade/opacity nhẹ (150–200ms). Tôn trọng `prefers-reduced-motion`.
- Blog, trang tĩnh, đăng nhập/đăng ký cũng đổi theo cùng hệ thiết kế.

## Phần 2: Luồng đặt hàng theo kiểu sàn TMĐT Việt Nam quen thuộc
Giữ phong cách hình ảnh tối giản ở Phần 1, nhưng **luồng thao tác** theo thói quen mua sắm trên sàn TMĐT mà người Việt đã quen:
- **Giỏ hàng:** checkbox chọn từng sản phẩm + "Chọn tất cả". Mỗi dòng có ảnh, tên, biến thể (bấm để đổi), đơn giá, ô tăng/giảm số lượng, thành tiền, nút xóa. **Thanh tổng tiền dính đáy màn hình**, hiện số món đã chọn, tổng tiền, tiết kiệm được và nút "Mua hàng". Chỉ sản phẩm được tick mới sang trang thanh toán.
- **Thanh toán (một trang):** khối địa chỉ nhận hàng ở đầu (đổi địa chỉ bằng modal, dùng `AddressForm.jsx`), danh sách sản phẩm, ô chọn voucher (modal danh sách voucher khả dụng/không khả dụng kèm lý do), chọn phương thức thanh toán (COD / MoMo / VNPay) dạng ô chọn, ghi chú cho shop, bảng chi tiết thanh toán (tiền hàng, phí vận chuyển, giảm giá, tổng). Nút "Đặt hàng" dính đáy.
- **Đơn mua của tôi (trong Tài khoản):** thanh tab trạng thái ngang: Tất cả · Chờ thanh toán · Chờ xác nhận · Đã xác nhận · Đang giao · Đã nhận · Đã hủy / Không nhận. Ánh xạ đúng với các trạng thái backend hiện có, **không tự thêm trạng thái mới**. Mỗi đơn là một thẻ có sản phẩm, tổng tiền và nút hành động theo trạng thái (Thanh toán lại, Hủy đơn, Đã nhận hàng, Đánh giá, Mua lại).
- **Chi tiết đơn:** timeline trạng thái (dùng `OrderTimeline.jsx`), địa chỉ, sản phẩm, chi tiết thanh toán, đếm ngược 30 phút cho đơn chờ thanh toán online.
- Toàn bộ luồng phải dùng tốt trên điện thoại (thiết kế mobile trước).

## Phần 3: Trang quản trị theo bố cục "kênh người bán"
Học cách tổ chức của các trang quản lý dành cho người bán trên sàn TMĐT, nhưng dùng màu và thương hiệu của tôi (cùng màu nhấn trầm ở Phần 1, nền xám rất nhạt, thẻ trắng).
- **Layout (`AdminLayout.jsx`):** sidebar trái chia nhóm có tiêu đề và mục con, thu gọn được: Quản lý đơn hàng · Quản lý sản phẩm (Tất cả sản phẩm, Thêm sản phẩm, Danh mục, Nhập hàng) · Kênh Marketing (Voucher, Banner) · Nội dung (Bài viết) · Khách hàng (Người dùng) · Dữ liệu (Tổng quan). Topbar có tên shop, chuông thông báo, avatar.
- **Tổng quan:** khối "Danh sách cần làm" với các ô số đếm bấm được (Chờ xác nhận, Chờ lấy hàng / Đã xác nhận, Đang giao, Đơn hủy, Sản phẩm hết hàng). Bên dưới là khối chỉ số kinh doanh (doanh thu, số đơn, tỷ lệ chuyển đổi nếu có dữ liệu) với biểu đồ chart.js và bộ chọn khoảng thời gian.
- **Quản lý đơn hàng:** tab trạng thái ngang kèm số đếm, thanh tìm kiếm (mã đơn, tên khách, SĐT) và lọc theo ngày, phương thức thanh toán. Bảng đơn: mỗi đơn là một khối có mã đơn, khách, sản phẩm (ảnh nhỏ), tổng tiền, trạng thái, nút hành động (Xác nhận, Giao hàng, Hủy…). Chọn nhiều đơn để xử lý hàng loạt. Giữ đúng các bước chuyển trạng thái và quy tắc hủy hiện có.
- **Quản lý sản phẩm:** tab Tất cả / Đang hoạt động / Hết hàng / Đã ẩn. Bảng có ảnh, tên, SKU/biến thể, giá, kho, đã bán, thao tác. Trang thêm/sửa sản phẩm (`ProductForm.jsx`) chia thành các khối thẻ: Thông tin cơ bản → Thông tin chi tiết → Thông tin bán hàng (biến thể, giá, kho) → Vận chuyển, có mục lục dính bên phải để nhảy giữa các khối.
- Voucher, Banner, Bài viết, Người dùng, Nhập hàng: đồng bộ cùng kiểu bảng + bộ lọc + trạng thái rỗng có hướng dẫn.

## Yêu cầu kỹ thuật
- Tạo **design tokens** (màu, khoảng cách, cỡ chữ, bo góc, viền) bằng `@theme` của Tailwind 4 trong `src/index.css`, dùng thống nhất ở mọi nơi, không hardcode màu rải rác.
- Tái sử dụng và nâng cấp `components/ui` và `components/admin/kit.jsx` thay vì viết lại component trùng lặp.
- Không thêm thư viện UI lớn (MUI, Ant…). Chỉ thêm thư viện nhỏ khi thật cần và hỏi tôi trước.
- Đảm bảo khả năng truy cập: tương phản chữ đạt WCAG AA, focus nhìn thấy được, label cho form, vùng chạm tối thiểu 44px trên mobile.
- Tiếng Việt có dấu, định dạng tiền bằng `lib/format.js`.
- Sau mỗi phần: chạy `npm run build` và `npm test` trong `frontend/` để chắc không lỗi.

## Cách làm việc
1. Đọc code hiện tại rồi đưa tôi **bản kế hoạch ngắn** + bảng design tokens đề xuất (màu, font, khoảng cách). **Chờ tôi duyệt rồi mới code.**
2. Làm lần lượt Phần 1 → Phần 2 → Phần 3. Xong mỗi phần thì dừng, tóm tắt đã đổi gì, liệt kê file đã sửa và hướng dẫn tôi xem thử (`npm run dev`), rồi chờ tôi đồng ý mới sang phần tiếp theo.
3. Commit sau mỗi phần với thông điệp rõ ràng.
4. Chỗ nào không chắc (ví dụ dữ liệu backend không có trường cần thiết), hãy hỏi tôi thay vì tự bịa dữ liệu hoặc tự sửa backend.
