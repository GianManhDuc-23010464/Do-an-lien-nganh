# Project Sell

> Website bán hàng đầy đủ: backend Spring Boot (REST API + JWT) và frontend React, hỗ trợ thanh toán MoMo / VNPay và trang quản trị kho – đơn hàng – khuyến mãi.

![Java](https://img.shields.io/badge/Java-17-orange) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-2.7.12-green) ![React](https://img.shields.io/badge/React-18-blue) ![MySQL](https://img.shields.io/badge/MySQL-8-blue)

## 🔗 Demo
- Live: _chưa deploy_
- Frontend (local): http://localhost:5173
- API (local): http://localhost:8080 · Swagger UI: http://localhost:8080/swagger-ui-custom.html

## ✨ Tính năng

**Khách hàng**
- Đăng ký / đăng nhập (JWT), kích hoạt email, quên mật khẩu
- Duyệt sản phẩm theo danh mục, biến thể (SKU / giá / tồn kho)
- Giỏ hàng dùng được khi chưa đăng nhập, tự gộp khi đăng nhập
- Mã giảm giá, thanh toán COD / MoMo / VNPay
- Theo dõi trạng thái đơn, đánh giá sao sản phẩm, đọc blog

**Quản trị**
- Tổng quan doanh thu
- Quản lý đơn hàng theo luồng trạng thái (gửi email mỗi lần đổi trạng thái)
- CRUD sản phẩm, danh mục, nhập hàng, voucher, banner, bài viết, người dùng

**Hệ thống**
- Phân quyền theo đường dẫn API, push notification (Firebase), upload ảnh (Cloudinary)
- Tự hủy đơn thanh toán online quá hạn và trả hàng về kho

## 🛠 Công nghệ
| Phần | Công nghệ |
|------|-----------|
| Frontend | React 18, Vite 5, Tailwind CSS 4 |
| Backend | Java 17, Spring Boot 2.7.12, Spring Security + JWT, Spring Data JPA |
| Database | MySQL 8 |
| Dịch vụ | Cloudinary (ảnh), Firebase (push), MoMo & VNPay (thanh toán), Gmail SMTP (email) |

## 📋 Yêu cầu
- JDK 17 (Lombok của Spring Boot 2.7 không chạy với JDK mới hơn)
- Node.js >= 18
- MySQL 8

## 🚀 Cài đặt

### 1. Clone

```bash
git clone <repo-url>
cd fullweb
```

### 2. Database

```bash
mysql -u root -p -e "CREATE DATABASE project_sell CHARACTER SET utf8mb4"
mysql -u root -p project_sell < backend/sql/project_sell.sql
mysql -u root -p project_sell < backend/sql/migration_v2.sql
mysql -u root -p project_sell < backend/sql/migration_v3.sql
```

> Chạy 3 file SQL theo đúng thứ tự.

### 3. Backend

```bash
cd backend/src/main/resources
cp application-local.properties.example application-local.properties   # DB, JWT, mail, Cloudinary, VNPay
cp environment.properties.example environment.properties               # key MoMo
# + đặt firebase-service-account.json (tải từ Firebase Console) vào cùng thư mục

cd ../../../..          # về thư mục backend
export JAVA_HOME=$(/usr/libexec/java_home -v 17)   # macOS
./mvnw spring-boot:run
```

API chạy ở http://localhost:8080

### 4. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Mở http://localhost:5173

### Tài khoản demo

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Quản trị | `admin@gmail.com` | `admin123` |

Trang quản trị: http://localhost:5173/admin. Khách hàng có thể tự đăng ký.

## ⚙️ Biến môi trường

Backend đọc secret từ `application-local.properties` và `environment.properties` (đều trong `.gitignore`). Mọi key cũng ghi đè được bằng biến môi trường hệ thống.

**`application-local.properties`**

| Khóa | Mô tả | Ví dụ |
|------|-------|-------|
| `spring.datasource.password` | Mật khẩu MySQL | `root` |
| `app.jwt.secret` | Khóa ký JWT (base64) | `openssl rand -base64 64` |
| `spring.mail.username` | Gmail gửi mail | `you@gmail.com` |
| `spring.mail.password` | Gmail App Password | `xxxx xxxx xxxx xxxx` |
| `cloudinary.cloud-name` | Cloudinary cloud name | `demo` |
| `cloudinary.api-key` | Cloudinary API key | `123456789` |
| `cloudinary.api-secret` | Cloudinary API secret | `abc...` |
| `vnpay.tmn-code` | Mã merchant VNPay sandbox | `ABCDEFGH` |
| `vnpay.hash-secret` | Khóa bí mật VNPay | `XXXX...` |

**`environment.properties`** (MoMo)

| Khóa | Mô tả | Ví dụ |
|------|-------|-------|
| `DEV_ACCESS_KEY` | MoMo access key (sandbox) | `your-value` |
| `DEV_PARTNER_CODE` | MoMo partner code (sandbox) | `MOMO` |
| `DEV_SECRET_KEY` | MoMo secret key (sandbox) | `your-value` |

**Khóa cấu hình hay chỉnh (`application.properties`)**

| Khóa | Mô tả | Mặc định |
|------|-------|----------|
| `server.port` | Cổng backend | `8080` |
| `app.frontend-url` | URL frontend (CORS, link email) | `http://localhost:5173` |
| `app.backend-url` | URL backend (notifyUrl MoMo) | `http://localhost:8080` |
| `app.order.payment-timeout-minutes` | Hủy đơn online quá hạn | `30` |
| `app.jwt.expiration-ms` | Thời hạn token | `604800000` (7 ngày) |
| `momo.env` | Môi trường MoMo | `dev` |

**Frontend (`.env`)**

| Biến | Mô tả | Ví dụ |
|------|-------|-------|
| `VITE_API_URL` | Địa chỉ backend | `http://localhost:8080` |

## 📁 Cấu trúc thư mục

```
fullweb/
├── backend/
│   ├── sql/                        project_sell.sql + migration_v2 / v3
│   └── src/main/
│       ├── java/com/web/
│       │   ├── api/                REST controller
│       │   ├── config/             CORS, Cloudinary, mail, Firebase, ModelMapper
│       │   ├── constants/          Hằng số dùng chung (role…)
│       │   ├── dto/                request / response
│       │   ├── entity/             JPA entity
│       │   ├── enums/
│       │   ├── exception/          Xử lý lỗi tập trung
│       │   ├── firebase/           Push notification
│       │   ├── mapper/
│       │   ├── job/                Tác vụ định kỳ (hủy đơn quá hạn)
│       │   ├── payment/            PaymentGatewayService, MoMo, VNPay
│       │   ├── repository/         Spring Data JPA
│       │   ├── security/           Spring Security + JWT
│       │   ├── service/ └ impl/    Service + cài đặt
│       │   └── utils/
│       └── resources/              application*.properties, firebase key
└── frontend/
    └── src/
        ├── lib/                    api (fetch + JWT), auth, giỏ hàng, hooks
        ├── components/             ui · shop · admin
        └── pages/                  shop · auth · admin
```

## 🔐 Phân quyền API

| Đường dẫn | Quyền |
|-----------|-------|
| `/api/**/public/**` | Ai cũng gọi được |
| `/api/**/user/**` | `ROLE_USER` |
| `/api/**/admin/**` | `ROLE_ADMIN` |
| `/api/upload/**` | Đã đăng nhập |
| `/api/payment/public/**` | Cổng thanh toán gọi IPN |
| Mọi `/api/**` khác | Đã đăng nhập |

## 📦 Build production

```bash
# Backend
cd backend && ./mvnw clean package
SPRING_PROFILES_ACTIVE=prod java -jar target/ProjectSell-*.jar

# Frontend
cd frontend && npm run build        # kết quả ở frontend/dist
```

Profile `prod` dùng `ddl-auto=validate`, tắt log SQL và Swagger, ẩn stacktrace.

## 🧪 Test

```bash
cd backend && ./mvnw test          # JUnit + H2 in-memory, không cần MySQL
cd frontend && npm test            # Vitest
```
