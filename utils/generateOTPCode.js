const crypto = require("crypto");

var otpStorage = {}; // Cái này vẫn lưu OTP trong bộ nhớ tạm thời

// Hàm tạo OTP
function generateOTP(email) {
  // Kiểm tra xem email đã có OTP chưa và nếu có thì nó đã hết hạn chưa
  if (otpStorage[email] && otpStorage[email].expires > new Date()) {
    // Nếu OTP chưa hết hạn, trả về OTP hiện tại và thời gian hết hạn
    return {
      otp: otpStorage[email].otp,
      expires: otpStorage[email].expires, // Thời gian hết hạn dạng Date
    };
  }

  // Tạo OTP mới
  const otp = crypto.randomInt(100000, 999999).toString();

  // Lưu OTP và thời gian hết hạn
  const expires = new Date(Date.now() + 3 * 60 * 1000); // OTP hết hạn sau 3 phút
  otpStorage[email] = { otp, expires };

  // Trả về OTP mới và thời gian hết hạn
  return { otp, expires };
}

// Xóa OTP đã hết hạn
function cleanExpiredOTP() {
  const now = Date.now();
  for (const email in otpStorage) {
    if (otpStorage[email].expires < now) {
      delete otpStorage[email]; // Xóa OTP đã hết hạn
    }
  }
}

// Thêm hàm này vào để dọn dẹp các OTP cũ, có thể gọi theo chu kỳ hoặc sự kiện
setInterval(cleanExpiredOTP, 60 * 1000); // Dọn dẹp mỗi phút

module.exports = { generateOTP };
