# Project Sell

Website bán hàng gồm backend **Spring Boot** (REST API + JWT) và frontend **React**.

```
.
├── backend/    Spring Boot 2.7, Java 17, MySQL
├── frontend/          React 18 + Vite + Tailwind CSS 4 (giao diện mới)
└── frontend-legacy/   Giao diện cũ (CRA) — chỉ để đối chiếu, có thể xóa
```

## Yêu cầu

- JDK **17** (Lombok của Spring Boot 2.7 không chạy với JDK mới hơn)
- Node.js 18+
- MySQL 8

## Cài đặt database

```bash
mysql -u root -p -e "CREATE DATABASE project_sell CHARACTER SET utf8mb4"
mysql -u root -p project_sell < backend/sql/project_sell.sql
```

## Chạy backend

1. Tạo file cấu hình bí mật từ file mẫu rồi điền giá trị thật:

   ```bash
   cd backend/src/main/resources
   cp application-local.properties.example application-local.properties
   cp environment.properties.example environment.properties   # key MoMo
   ```

   Đặt thêm `firebase-service-account.json` (tải từ Firebase Console) vào cùng thư mục.
   Cả ba file này đều nằm trong `.gitignore`, **không commit**.

2. Chạy:

   ```bash
   cd backend
   export JAVA_HOME=$(/usr/libexec/java_home -v 17)   # macOS
   ./mvnw spring-boot:run
   ```

API chạy ở `http://localhost:8080`, Swagger UI ở `/swagger-ui-custom.html`.

Mọi giá trị trong `application.properties` đều có thể ghi đè bằng biến môi trường,
ví dụ `SPRING_DATASOURCE_PASSWORD`, `APP_JWT_SECRET`.

### Profile

| Profile | Dùng khi | Khác biệt |
|---------|----------|-----------|
| `dev` (mặc định) | Phát triển | `ddl-auto=update`, log SQL |
| `prod` | Deploy | `ddl-auto=validate`, tắt log SQL, tắt Swagger, ẩn stacktrace |

Chạy production: `SPRING_PROFILES_ACTIVE=prod java -jar target/ProjectSell-*.jar`

### Thanh toán

- **MoMo**: key đặt trong `environment.properties`.
- **Luồng**: tạo đơn trước (giữ hàng) rồi mới chuyển sang cổng; số tiền luôn lấy từ đơn trong DB.
- **VNPay**: đăng ký tài khoản sandbox tại https://sandbox.vnpayment.vn/devreg/ rồi điền
  `vnpay.tmn-code` và `vnpay.hash-secret` vào `application-local.properties`.
  Khi lên production, đổi `vnpay.pay-url` sang `https://pay.vnpay.vn/vpcpay.html`.

## Test

```bash
cd backend && ./mvnw test          # JUnit + H2 in-memory, không cần MySQL
cd frontend && npm test            # Vitest
```

## Chạy frontend

```bash
cd frontend
cp .env.example .env      # sửa VITE_API_URL nếu backend không chạy ở localhost:8080
npm install
npm run dev
```

Mở `http://localhost:5173`. Build production: `npm run build` (kết quả ở `frontend/dist`).

Cấu trúc:

```
src/
├── lib/            api (fetch + JWT), auth, giỏ hàng, định dạng, hooks
├── components/
│   ├── ui/         nút, modal, phân trang, badge, sao đánh giá…
│   ├── shop/       header, footer, thẻ sản phẩm, form địa chỉ, timeline đơn
│   └── admin/      layout admin, bảng, upload ảnh, trình soạn thảo
└── pages/
    ├── shop/       trang chủ, sản phẩm, chi tiết, giỏ, thanh toán, tài khoản, blog
    ├── auth/       đăng nhập, đăng ký, kích hoạt, quên mật khẩu
    └── admin/      tổng quan, đơn hàng, sản phẩm, danh mục, nhập hàng, voucher, banner, bài viết, người dùng
```

## Luồng mua hàng

```
Khách: xem sản phẩm → thêm giỏ (chưa đăng nhập cũng được, giỏ tự gộp khi đăng nhập)
     → thanh toán: chọn địa chỉ, mã giảm giá, COD / MoMo / VNPay
        • COD   → đơn "Chờ xác nhận" ngay
        • Online → đơn "Chờ thanh toán", giữ hàng 30 phút → chuyển sang cổng
                   → cổng gọi IPN + khách quay về /payment/result → đơn "Chờ xác nhận"
                   → quá 30 phút chưa trả: tự hủy, trả hàng về kho
Admin: Chờ xác nhận → Đã xác nhận → Đang giao → Đã nhận / Không nhận   (hủy được ở 2 bước đầu)
       Mỗi lần đổi trạng thái khách nhận email; hủy / không nhận thì hàng tự cộng lại kho.
Khách đã nhận hàng → được đánh giá sao sản phẩm.
```

### Thanh toán online khi chạy local

Cổng thanh toán cần gọi được về backend (IPN). Khi chạy trên máy cá nhân, dùng
[ngrok](https://ngrok.com): `ngrok http 8080`, rồi đặt `app.backend-url` bằng địa chỉ ngrok
(cho MoMo) và khai báo `{ngrok}/api/payment/public/vnpay-ipn` trong trang quản trị VNPay sandbox.
Không có IPN thì đơn vẫn được xác nhận khi khách quay về trang kết quả.

## Cấu trúc backend

```
com.web
├── api/              REST controller
├── config/           Cấu hình Spring (CORS, Cloudinary, mail, Firebase, ModelMapper…)
├── constants/        Hằng số dùng chung (role…)
├── dto/              request / response
├── entity/           JPA entity
├── enums/
├── exception/        Exception + xử lý lỗi tập trung
├── firebase/         Push notification
├── mapper/
├── job/              Tác vụ định kỳ (hủy đơn quá hạn thanh toán)
├── payment/          PaymentGatewayService, MoMo, VNPay
├── repository/       Spring Data JPA
├── security/         Spring Security + JWT
├── service/          Interface service
│   └── impl/         Cài đặt service
└── utils/
```

## Phân quyền API

| Đường dẫn               | Quyền        |
|-------------------------|--------------|
| `/api/**/public/**`     | Ai cũng gọi được |
| `/api/**/user/**`       | `ROLE_USER`  |
| `/api/**/admin/**`      | `ROLE_ADMIN` |
| `/api/upload/**`        | Đã đăng nhập |
| `/api/payment/public/**`| Cổng thanh toán gọi IPN |
| Mọi `/api/**` khác      | Đã đăng nhập |
