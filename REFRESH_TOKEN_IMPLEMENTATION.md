# Refresh Token Implementation

## 📋 Tổng quan

Hệ thống Refresh Token giúp:
- **Bảo mật cao hơn**: Access token có thời gian sống ngắn (7 ngày)
- **UX tốt hơn**: User không bị logout khi access token hết hạn
- **Kiểm soát session**: Có thể revoke refresh token để force logout
- **Token rotation**: Tạo refresh token mới mỗi lần refresh để tăng security

## 🔑 Token Strategy

### Access Token
- **Lifetime**: 7 ngày
- **Purpose**: Xác thực API requests
- **Storage**: Memory/State (không lưu DB)
- **Payload**: userId, email, role, status

### Refresh Token
- **Lifetime**: 30 ngày
- **Purpose**: Tạo access token mới
- **Storage**: Database (để validate và revoke)
- **Payload**: userId only

## 🗄️ Database Schema

```javascript
// UserModel
{
  refreshToken: {
    type: String,
    default: null  // JWT refresh token
  },
  refreshTokenExpiry: {
    type: Date,
    default: null  // Expiry date
  }
}
```

## 🔄 Authentication Flow

### 1. Login Flow

```
Client                    Server                    Database
  |                         |                           |
  |------ POST /login ----->|                           |
  |  { email, password }    |                           |
  |                         |---- Find User ----------->|
  |                         |<----- User Data ----------|
  |                         |                           |
  |                         |-- Verify Password         |
  |                         |                           |
  |                         |-- Generate Tokens         |
  |                         |   - accessToken (7d)      |
  |                         |   - refreshToken (30d)    |
  |                         |                           |
  |                         |---- Save Refresh Token -->|
  |                         |<----- Success ------------|
  |                         |                           |
  |<--- Response ----------|                           |
  |  { accessToken,         |                           |
  |    refreshToken,        |                           |
  |    user }               |                           |
  |                         |                           |
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "fullName": "User Name",
      "role": "member"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  },
  "message": "Login successful"
}
```

### 2. API Request Flow

```
Client                    Server
  |                         |
  |---- GET /api/posts ---->|
  |  Authorization:         |
  |  Bearer {accessToken}   |
  |                         |-- Verify Token
  |                         |                           
  |<--- Response ----------|
  |  { posts: [...] }       |
  |                         |
```

### 3. Token Expired Flow

```
Client                    Server                    Database
  |                         |                           |
  |---- GET /api/posts ---->|                           |
  |  Authorization:         |                           |
  |  Bearer {expired}       |                           |
  |                         |-- Verify Token            |
  |                         |   ❌ Token Expired        |
  |                         |                           |
  |<--- 401 Unauthorized ---|                           |
  |  { error: "TOKEN_EXPIRED" }                         |
  |                         |                           |
  |---- POST /refresh-token->|                          |
  |  { refreshToken }       |                           |
  |                         |-- Verify Refresh Token    |
  |                         |                           |
  |                         |---- Find User ----------->|
  |                         |<----- User Data ----------|
  |                         |                           |
  |                         |-- Validate Refresh Token  |
  |                         |   (match với DB)          |
  |                         |                           |
  |                         |-- Generate New Tokens     |
  |                         |   - new accessToken       |
  |                         |   - new refreshToken      |
  |                         |                           |
  |                         |---- Update DB ----------->|
  |                         |<----- Success ------------|
  |                         |                           |
  |<--- Response -----------|                           |
  |  { accessToken,         |                           |
  |    refreshToken }       |                           |
  |                         |                           |
  |---- GET /api/posts ---->|                           |
  |  Authorization:         |                           |
  |  Bearer {newToken}      |                           |
  |                         |-- Verify Token ✅         |
  |                         |                           |
  |<--- Response -----------|                           |
  |  { posts: [...] }       |                           |
  |                         |                           |
```

### 4. Logout Flow

```
Client                    Server                    Database
  |                         |                           |
  |---- POST /logout ------>|                           |
  |  Authorization:         |                           |
  |  Bearer {accessToken}   |                           |
  |                         |-- Verify Token            |
  |                         |                           |
  |                         |---- Clear Refresh Token ->|
  |                         |  SET refreshToken = null  |
  |                         |  SET expiry = null        |
  |                         |<----- Success ------------|
  |                         |                           |
  |<--- Response -----------|                           |
  |  { success: true }      |                           |
  |                         |                           |
```

## 📡 API Endpoints

### POST /api/auth/login
Đăng nhập và nhận tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "fullName": "User Name",
      "profilePicture": "url",
      "role": "member"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

### POST /api/auth/refresh-token
Làm mới access token khi hết hạn.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "fullName": "User Name",
      "role": "member"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Token refreshed successfully"
}
```

**Error Response (Token Invalid):**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_REFRESH_TOKEN_FAILED",
    "message": "Invalid refresh token. Please login again."
  },
  "path": "/api/auth/refresh-token",
  "timestamp": "2025-11-12T10:30:00.000Z"
}
```

### POST /api/auth/logout
Đăng xuất và xóa refresh token.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## 💻 Frontend Implementation

### 1. Store Tokens

```javascript
// src/utils/tokenStorage.js
export const TokenStorage = {
  // Store tokens
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  // Get tokens
  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),

  // Clear tokens
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  // Check if tokens exist
  hasTokens: () => {
    return !!localStorage.getItem('accessToken') && 
           !!localStorage.getItem('refreshToken');
  }
};
```

### 2. Axios Interceptor

```javascript
// src/core/httpClient/interceptors.js
import axios from 'axios';
import { TokenStorage } from '../utils/tokenStorage';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor - Add token to headers
axios.interceptors.request.use(
  config => {
    const token = TokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor - Handle 401 and refresh token
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = TokenStorage.getRefreshToken();

      if (!refreshToken) {
        // No refresh token, redirect to login
        TokenStorage.clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Call refresh token API
        const response = await axios.post('/api/auth/refresh-token', {
          refreshToken
        });

        if (response.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          
          // Save new tokens
          TokenStorage.setTokens(accessToken, newRefreshToken);
          
          // Update authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          // Process queued requests
          processQueue(null, accessToken);
          
          // Retry original request
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout
        processQueue(refreshError, null);
        TokenStorage.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

### 3. Login Component

```javascript
// src/modules/auth/pages/LoginPage.jsx
import { TokenStorage } from '../../../core/utils/tokenStorage';
import api from '../../../core/httpClient';

const LoginPage = () => {
  const handleLogin = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        
        // Store tokens
        TokenStorage.setTokens(accessToken, refreshToken);
        
        // Store user info
        localStorage.setItem('user', JSON.stringify(user));
        
        // Redirect to home
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Login error:', error);
      // Show error message
    }
  };

  return (
    // Login form JSX
  );
};
```

### 4. Logout Function

```javascript
// src/modules/auth/utils/logout.js
import api from '../../../core/httpClient';
import { TokenStorage } from '../../../core/utils/tokenStorage';

export const logout = async () => {
  try {
    // Call logout API
    await api.post('/api/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear tokens regardless of API result
    TokenStorage.clearTokens();
    localStorage.removeItem('user');
    
    // Redirect to login
    window.location.href = '/login';
  }
};
```

## 🔒 Security Best Practices

### 1. Token Storage
- ✅ **DO**: Store tokens in localStorage/sessionStorage
- ❌ **DON'T**: Store in cookies without httpOnly flag (XSS vulnerability)
- ❌ **DON'T**: Store in plain variables (lost on refresh)

### 2. Token Expiry
- ✅ **DO**: Set reasonable expiry times
  - Access Token: 15 minutes - 7 days (we use 7 days)
  - Refresh Token: 7-30 days (we use 30 days)
- ✅ **DO**: Implement token rotation (new refresh token on each refresh)

### 3. Validation
- ✅ **DO**: Validate refresh token against database
- ✅ **DO**: Check token expiry in database
- ✅ **DO**: Verify user is still active
- ✅ **DO**: Clear token on logout

### 4. HTTPS
- ✅ **DO**: Always use HTTPS in production
- ❌ **DON'T**: Send tokens over HTTP

### 5. Rate Limiting
- ✅ **DO**: Implement rate limiting on refresh endpoint
- ✅ **DO**: Track failed refresh attempts
- ✅ **DO**: Block suspicious activity

## 🧪 Testing

### Manual Testing

**1. Test Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**2. Test API with Access Token:**
```bash
curl -X GET http://localhost:5000/api/posts \
  -H "Authorization: Bearer {accessToken}"
```

**3. Test Refresh Token:**
```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "{refreshToken}"
  }'
```

**4. Test Logout:**
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer {accessToken}"
```

### Postman Collection

Import this JSON to Postman:

```json
{
  "info": {
    "name": "Chaotok Auth - Refresh Token",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/auth/login",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}"
        }
      }
    },
    {
      "name": "Refresh Token",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/auth/refresh-token",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"refreshToken\": \"{{refreshToken}}\"\n}"
        }
      }
    },
    {
      "name": "Logout",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/auth/logout",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{accessToken}}"
          }
        ]
      }
    }
  ]
}
```

## 🐛 Troubleshooting

### Issue 1: "Invalid refresh token"
**Причина:** Token không khớp với DB hoặc đã bị revoke
**Giải pháp:** User phải login lại

### Issue 2: "Refresh token has expired"
**Причина:** Token đã quá 30 ngày
**Giải pháp:** User phải login lại

### Issue 3: Multiple refresh calls
**Причина:** Nhiều API calls cùng lúc khi token expired
**Giải pháp:** Đã implement request queue trong interceptor

### Issue 4: Token rotation loop
**Причина:** Client cache token cũ
**Giải pháp:** Always update token sau khi refresh

## 📊 Monitoring

### Metrics to Track
- Refresh token success rate
- Token expiry frequency
- Failed refresh attempts
- Average token lifetime

### Logs to Keep
- Refresh token requests
- Failed refresh attempts
- Suspicious patterns (many refreshes from same IP)

## 🔄 Migration

Run migration để thêm fields cho existing users:

```bash
cd FaceTok_Sever
node migrations/add-refresh-token-fields.js
```

Existing users sẽ có:
- `refreshToken: null`
- `refreshTokenExpiry: null`

Họ cần login lại để nhận refresh token.

## ✅ Checklist

- [x] Thêm refreshToken fields vào UserModel
- [x] Implement login với token saving
- [x] Implement refresh token endpoint
- [x] Implement logout endpoint
- [x] Tạo migration script
- [ ] Update frontend axios interceptor
- [ ] Update login page to store tokens
- [ ] Update logout function
- [ ] Test all flows
- [ ] Add rate limiting
- [ ] Monitor refresh token usage

---

**Updated:** 12/11/2025
**Version:** 1.0
