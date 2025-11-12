# Refactor: Di Chuyển uploadMessageMedia vào Shared Middlewares

## 📋 Tổng Quan Thay Đổi

Di chuyển `uploadMessageMedia.js` từ `modules/message/middlewares/` sang `shared/middlewares/` để đồng nhất cấu trúc thư mục và tái sử dụng.

## 🔄 Thay Đổi Cấu Trúc

### Trước (Before)
```
src/
├── shared/
│   └── middlewares/
│       ├── checkLogin.js
│       ├── checkAdmin.js
│       ├── rateLimiter.js
│       ├── uploadImageMiddleware.js
│       └── uploadMediaMiddleware.js
│
└── modules/
    └── message/
        ├── middlewares/              ← Folder riêng cho message
        │   └── uploadMessageMedia.js
        └── api/
            └── routes.js
```

### Sau (After)
```
src/
├── shared/
│   └── middlewares/
│       ├── checkLogin.js
│       ├── checkAdmin.js
│       ├── rateLimiter.js
│       ├── uploadImageMiddleware.js
│       ├── uploadMediaMiddleware.js
│       ├── uploadMessageMedia.js    ← Đã di chuyển
│       └── index.js                 ← Đã cập nhật export
│
└── modules/
    └── message/
        ├── api/
        │   └── routes.js            ← Đã cập nhật import
        └── (không còn folder middlewares)
```

## 📝 Files Đã Thay Đổi

### 1. **Di Chuyển File**
**File:** `uploadMessageMedia.js`

**Path cũ:** `src/modules/message/middlewares/uploadMessageMedia.js`
**Path mới:** `src/shared/middlewares/uploadMessageMedia.js`

**Command:**
```bash
Move-Item uploadMessageMedia.js -Destination shared/middlewares/
Remove-Item modules/message/middlewares -Recurse
```

### 2. **Cập Nhật Export Index**
**File:** `src/shared/middlewares/index.js`

```javascript
// Trước
module.exports = {
  checkLogin,
  checkAdmin,
  uploadImageMiddleware,
  uploadMediaMiddleware
};

// Sau
const { handleMediaUpload, uploadMessageMedia } = require('./uploadMessageMedia');

module.exports = {
  checkLogin,
  checkAdmin,
  uploadImageMiddleware,
  uploadMediaMiddleware,
  handleMediaUpload,        // ← Thêm
  uploadMessageMedia        // ← Thêm
};
```

### 3. **Cập Nhật Import trong Routes**
**File:** `src/modules/message/api/routes.js`

```javascript
// Trước
const checkLogin = require("../../../shared/middlewares/checkLogin");
const { handleMediaUpload } = require("../middlewares/uploadMessageMedia");

// Sau
const { checkLogin, handleMediaUpload } = require("../../../shared/middlewares");
```

### 4. **Cập Nhật Documentation**
**File:** `FaceTok_client/CHAT_MEDIA_GUIDE.md`

```markdown
# Trước
- FaceTok_Sever/src/modules/message/middlewares/uploadMessageMedia.js

# Sau
- FaceTok_Sever/src/shared/middlewares/uploadMessageMedia.js
```

## ✅ Lợi Ích

### 1. **Đồng Nhất Cấu Trúc**
- ✅ Tất cả middlewares giờ nằm trong `shared/middlewares/`
- ✅ Không còn folder middlewares rải rác trong modules
- ✅ Dễ tìm kiếm và bảo trì

### 2. **Import Sạch Hơn**
```javascript
// Trước: Import từ nhiều nơi
const checkLogin = require("../../../shared/middlewares/checkLogin");
const { handleMediaUpload } = require("../middlewares/uploadMessageMedia");

// Sau: Import từ 1 nơi
const { checkLogin, handleMediaUpload } = require("../../../shared/middlewares");
```

### 3. **Tái Sử Dụng Dễ Dàng**
- ✅ Middleware có thể dùng cho nhiều modules khác (post, user...)
- ✅ Centralized configuration
- ✅ Dễ dàng mở rộng cho future features

### 4. **Giảm Độ Phức Tạp**
- ✅ Xóa folder `modules/message/middlewares/` trống
- ✅ Giảm nested folders
- ✅ Cấu trúc rõ ràng hơn

## 🧪 Testing Checklist

Sau khi refactor, cần test lại các chức năng:

- [ ] **Import Path:** Server khởi động không lỗi
- [ ] **Route Middleware:** POST /room/:roomId/message vẫn hoạt động
- [ ] **File Upload:** Gửi tin nhắn có ảnh/video thành công
- [ ] **Validation:** Multer limits vẫn hoạt động (5 files, 50MB)
- [ ] **Error Handling:** File type không hợp lệ bị reject

## 🎯 Cấu Trúc Modules Sau Refactor

Tất cả modules giờ có cấu trúc đồng nhất:

```
modules/
├── auth/
│   ├── api/
│   ├── controllers/
│   ├── dtos/
│   ├── services/
│   └── validations/
│
├── message/
│   ├── api/
│   ├── controllers/
│   ├── dtos/
│   ├── helpers/
│   ├── models/
│   ├── repositories/
│   ├── services/
│   ├── socket/
│   └── validations/
│
└── (không còn folder middlewares trong bất kỳ module nào)
```

## 📚 Related Changes

### PR/Commit Context
- **Feature:** Chat Media Upload (ảnh/video trong tin nhắn)
- **Refactor:** Consolidate middlewares vào shared folder
- **Breaking Changes:** None (chỉ thay đổi internal structure)

### Files Modified
1. ✅ `src/shared/middlewares/uploadMessageMedia.js` (moved)
2. ✅ `src/shared/middlewares/index.js` (updated exports)
3. ✅ `src/modules/message/api/routes.js` (updated imports)
4. ✅ `FaceTok_client/CHAT_MEDIA_GUIDE.md` (updated paths)
5. ✅ `src/modules/message/middlewares/` (deleted folder)

### Backward Compatibility
- ✅ API endpoints không thay đổi
- ✅ Middleware logic không thay đổi
- ✅ Frontend không cần thay đổi
- ✅ Chỉ thay đổi import paths (internal)

## 🚀 Next Steps

Sau refactor này, có thể:

1. **Tái sử dụng uploadMessageMedia cho Post module**
   - Upload media trong posts
   - Reuse cùng validation logic

2. **Tạo unified upload middleware**
   - Merge uploadImageMiddleware, uploadMediaMiddleware, uploadMessageMedia
   - Single source of truth cho file uploads

3. **Standardize module structure**
   - Remove middlewares folders từ tất cả modules
   - Chỉ giữ middlewares trong shared/

## 📖 Documentation Links

- Backend media feature: `FaceTok_Sever/CHAT_MEDIA_FEATURE.md`
- Frontend guide: `FaceTok_client/CHAT_MEDIA_GUIDE.md`
- Middleware refactor: `MIDDLEWARE_REFACTOR.md` (this file)
