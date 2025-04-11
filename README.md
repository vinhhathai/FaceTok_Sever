# FaceTok Server

## Giới thiệu
FaceTok Server là backend của ứng dụng mạng xã hội FaceTok, được xây dựng với kiến trúc Modular Monolith.

## Kiến trúc
Dự án sử dụng kiến trúc **Modular Monolith**, tổ chức theo các module chức năng:

```
FaceTok_Sever/
├── src/
│   ├── modules/        # Các module chức năng
│   │   ├── auth/       # Xác thực
│   │   ├── user/       # Quản lý người dùng
│   │   ├── post/       # Bài đăng
│   │   ├── message/    # Tin nhắn
│   │   ├── friend/     # Kết bạn
│   │   └── notification/ # Thông báo
│   │
│   ├── shared/         # Các thành phần dùng chung
│   │   ├── database/   # Kết nối database
│   │   ├── middlewares/ # Middleware
│   │   ├── services/   # Dịch vụ dùng chung
│   │   ├── swagger/    # Tài liệu API
│   │   └── utils/      # Tiện ích
│   │
│   ├── app.js          # Express application
│   └── server.js       # Entry point
│
└── public/             # Tệp tĩnh
```

## Cấu trúc Module
Mỗi module đều có cấu trúc cơ bản:
- **models/**: Định nghĩa schema dữ liệu
- **repositories/**: Tương tác với database
- **services/**: Xử lý logic nghiệp vụ
- **controllers/**: Xử lý HTTP request/response
- **api/**: Định nghĩa routes
- **index.js**: Export các thành phần public

## Các công nghệ sử dụng
- **Node.js**: Môi trường thực thi
- **Express**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM cho MongoDB
- **Socket.IO**: Kết nối realtime
- **JWT**: Xác thực
- **Swagger**: Tài liệu API

## Yêu cầu hệ thống
- Node.js (>=14.0.0)
- MongoDB

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Cấu hình môi trường
cp .env.example .env
# Chỉnh sửa file .env phù hợp với môi trường

# Khởi chạy ở chế độ development
npm run dev

# Khởi chạy ở chế độ production
npm run prod
```

## Tài liệu API
Sau khi khởi động server, truy cập:
```
http://localhost:3000/api-docs
``` 