# Terms & Privacy Acceptance Tracking

## 📋 Tổng quan

Hệ thống tracking việc user chấp nhận Terms of Service và Privacy Policy, đáp ứng yêu cầu pháp lý về bằng chứng đồng ý.

## 🗄️ Database Schema

### UserModel - termsAcceptance Field

```javascript
termsAcceptance: {
  accepted: {
    type: Boolean,
    default: false,
    required: true
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  version: {
    type: String,
    default: null  // "1.0", "1.1", etc.
  },
  ipAddress: {
    type: String,
    default: null  // IP khi user accept
  }
}
```

### Tại sao cần track?

1. **Bằng chứng pháp lý**: Chứng minh user đã đồng ý với điều khoản
2. **Tuân thủ GDPR/CCPA**: Yêu cầu có consent rõ ràng
3. **Audit trail**: Theo dõi khi nào user đồng ý
4. **Version control**: Biết user đồng ý version nào
5. **Dispute resolution**: Giải quyết tranh chấp

## 🔄 Flow Đăng Ký

### 1. User Registration

```
1. User điền form đăng ký
2. User PHẢI tick checkbox "Đồng ý với Điều khoản..."
3. Frontend validation: Không cho submit nếu chưa tick
4. Backend nhận request với IP address
5. Lưu vào DB:
   - accepted: true
   - acceptedAt: new Date()
   - version: "1.0"
   - ipAddress: req.ip
```

### 2. Backend Code

**AuthRegisterService.js:**
```javascript
async register(data, ipAddress = null) {
  const userData = {
    // ... other fields
    termsAcceptance: {
      accepted: true,
      acceptedAt: new Date(),
      version: "1.0",
      ipAddress: ipAddress
    }
  };
  
  await this.userRepository.create(userData);
}
```

**AuthRegisterController.js:**
```javascript
signUp = async (req, res) => {
  // Lấy IP từ request
  const ipAddress = req.ip || 
                   req.headers['x-forwarded-for']?.split(',')[0] || 
                   req.connection.remoteAddress || 
                   null;
  
  const result = await this.authRegisterService.register(value, ipAddress);
}
```

## 📊 Admin Panel Integration

### View Terms Acceptance Info

Admin có thể xem thông tin trong User Management:

```javascript
// AdminDto.js - toUserResponse
{
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  // ...
  termsAcceptance: {
    accepted: true,
    acceptedAt: "2025-11-12T10:30:00.000Z",
    version: "1.0",
    ipAddress: "192.168.1.100"
  }
}
```

### Display in UI

```jsx
// UserManagement.jsx
<TableCell>
  {user.termsAcceptance?.accepted ? (
    <Chip 
      label={`v${user.termsAcceptance.version}`}
      color="success"
      size="small"
    />
  ) : (
    <Chip label="Chưa đồng ý" color="error" size="small" />
  )}
</TableCell>
```

## 🔄 Migration Script

Cập nhật users hiện có trong database:

```bash
cd FaceTok_Sever
node migrations/add-terms-acceptance.js
```

Script này sẽ:
- Tìm tất cả users chưa có termsAcceptance
- Cập nhật với:
  - accepted: true (assume existing users accepted)
  - acceptedAt: user.createdAt (ngày đăng ký)
  - version: "1.0"
  - ipAddress: null (không có data cũ)

## ⚖️ Compliance Requirements

### Pháp luật Việt Nam

**Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân:**
- Điều 12: Phải có sự đồng ý của chủ thể dữ liệu
- Phải ghi nhận rõ ràng sự đồng ý
- Phải lưu trữ bằng chứng đồng ý

**Nghị định 15/2020/NĐ-CP về Mạng xã hội:**
- Phải có điều khoản sử dụng rõ ràng
- User phải đồng ý trước khi sử dụng dịch vụ

### International Standards

**GDPR (EU):**
- Article 7: Conditions for consent
- Must be freely given, specific, informed
- Must be able to prove consent

**CCPA (California):**
- Must disclose data collection practices
- Must obtain consent for data processing

## 📝 Best Practices

### 1. Khi Update Terms

Nếu cập nhật điều khoản lên version mới:

```javascript
// Step 1: Update version in termsOfService.js
export const termsOfService = {
  lastUpdated: "01/12/2025",
  version: "2.0",  // Changed from 1.0
  // ...
}

// Step 2: Notify existing users
// Gửi email hoặc in-app notification

// Step 3: Yêu cầu re-accept
// Check if user.termsAcceptance.version < currentVersion
// Show dialog yêu cầu đồng ý lại
```

### 2. Audit Log

Có thể tạo collection riêng để log:

```javascript
// TermsAcceptanceLog collection
{
  userId: ObjectId,
  action: "accepted" | "declined" | "updated",
  version: "1.0",
  ipAddress: "192.168.1.100",
  userAgent: "Mozilla/5.0...",
  timestamp: Date
}
```

### 3. Verify on Critical Actions

Check trước các hành động quan trọng:

```javascript
// Middleware
const checkTermsAcceptance = async (req, res, next) => {
  const user = await User.findById(req.userId);
  
  if (!user.termsAcceptance?.accepted) {
    return res.status(403).json({
      error: 'TERMS_NOT_ACCEPTED',
      message: 'You must accept Terms to continue'
    });
  }
  
  // Check version
  const currentVersion = "1.0";
  if (user.termsAcceptance.version !== currentVersion) {
    return res.status(403).json({
      error: 'TERMS_OUTDATED',
      message: 'Please accept updated Terms'
    });
  }
  
  next();
};
```

## 🔒 Security & Privacy

### IP Address Handling

**Lưu ý quan trọng:**
- IP address là dữ liệu cá nhân theo GDPR
- Chỉ lưu để mục đích bảo mật và pháp lý
- Không được chia sẻ với bên thứ ba
- Phải anonymize sau một thời gian (ví dụ: 1 năm)

### Data Retention

```javascript
// Anonymize IP after 1 year
const anonymizeOldIPs = async () => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  await User.updateMany(
    { 'termsAcceptance.acceptedAt': { $lt: oneYearAgo } },
    { $set: { 'termsAcceptance.ipAddress': 'anonymized' } }
  );
};
```

## 📊 Reporting

### Generate Compliance Report

```javascript
// Report: Terms acceptance rate
const getAcceptanceRate = async () => {
  const total = await User.countDocuments({});
  const accepted = await User.countDocuments({ 
    'termsAcceptance.accepted': true 
  });
  
  return {
    total,
    accepted,
    rate: (accepted / total * 100).toFixed(2) + '%'
  };
};

// Report: Acceptance by version
const getAcceptanceByVersion = async () => {
  return await User.aggregate([
    {
      $group: {
        _id: '$termsAcceptance.version',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: -1 }
    }
  ]);
};
```

## ✅ Checklist Implementation

- [x] Thêm termsAcceptance field vào UserModel
- [x] Update AuthRegisterService để lưu acceptance
- [x] Update AuthRegisterController để lấy IP
- [x] Update AdminDto để hiển thị info
- [x] Tạo migration script cho users hiện có
- [ ] Thêm UI trong Admin Panel để xem info
- [ ] Implement version check khi update terms
- [ ] Tạo cron job anonymize IP sau 1 năm
- [ ] Tạo audit log collection (optional)
- [ ] Implement re-acceptance flow cho version mới

## 📞 Support

Nếu có câu hỏi về compliance hoặc implementation, tham khảo:
- Luật sư chuyên ngành công nghệ
- Cục An toàn thông tin (Bộ TT&TT)
- GDPR compliance resources

---

**Lưu ý:** Đây là implementation cơ bản. Tùy vào quy mô và yêu cầu pháp lý cụ thể, có thể cần thêm các biện pháp bổ sung.
