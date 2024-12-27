/**
 * @swagger
 * /auth/sign-up:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - fullName
 *               - password
 *               - confirmPassword
 *               - birthday
 *             properties:
 *               email:
 *                 type: string
 *                 description: Địa chỉ email của người dùng
 *                 format: email
 *                 example: johndoe@example.com
 *               fullName:
 *                 type: string
 *                 description: Họ và tên của người dùng
 *                 example: John Doe
 *               password:
 *                 type: string
 *                 description: Mật khẩu của người dùng
 *                 minLength: 6
 *                 maxLength: 255
 *                 example: "Password123!"
 *               confirmPassword:
 *                 type: string
 *                 description: Xác nhận mật khẩu (phải khớp với password)
 *                 minLength: 6
 *                 maxLength: 255
 *                 example: "Password123!"
 *               birthday:
 *                 type: string
 *                 description: Ngày sinh của người dùng (định dạng DD-MM-YYYY)
 *                 format: date
 *                 example: "01-01-1990"
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Thông báo tạo tài khoản thành công
 *                   example: "Account created successfully"
 *       400:
 *         description: Yêu cầu không hợp lệ (thiếu hoặc không đúng định dạng)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                   description: Thời gian xảy ra lỗi
 *                   example: "2024-11-23T12:00:00.000Z"
 *                 path:
 *                   type: string
 *                   description: Đường dẫn API gây lỗi
 *                   example: "/auth/sign-up"
 *                 code:
 *                   type: string
 *                   description: Mã lỗi
 *                   example: "VALIDATION_FAILED"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Nội dung lỗi
 *                       example: "Email không đúng định dạng"
 *       409:
 *         description: Email đã tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                   description: Thời gian xảy ra lỗi
 *                   example: "2024-11-23T12:00:00.000Z"
 *                 path:
 *                   type: string
 *                   description: Đường dẫn API gây lỗi
 *                   example: "/auth/sign-up"
 *                 code:
 *                   type: string
 *                   description: Mã lỗi
 *                   example: "DATA_CONFLICT"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Nội dung lỗi
 *                       example: "Email đã tồn tại"
 *       500:
 *         description: Lỗi từ server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                   description: Thời gian xảy ra lỗi
 *                   example: "2024-11-23T12:00:00.000Z"
 *                 path:
 *                   type: string
 *                   description: Đường dẫn API gây lỗi
 *                   example: "/auth/sign-up"
 *                 code:
 *                   type: string
 *                   description: Mã lỗi
 *                   example: "ERR_CREATE_ACCOUNT_FAILED"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Nội dung lỗi
 *                       example: "Lỗi không xác định từ server"
 */
