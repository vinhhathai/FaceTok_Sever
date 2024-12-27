/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Đăng nhập vào hệ thống
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: Địa chỉ email của người dùng
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 description: Mật khẩu của người dùng
 *                 example: "Password123!"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Thông báo đăng nhập thành công
 *                   example: "Login successfully"
 *                 accessToken:
 *                   type: string
 *                   description: JWT token truy cập của người dùng
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken:
 *                   type: string
 *                   description: JWT token để làm mới accessToken
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Yêu cầu không hợp lệ (thiếu hoặc không đúng định dạng email/password)
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
 *                   example: "/auth/login"
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
 *       404:
 *         description: Không tìm thấy tài khoản với email cung cấp hoặc sai mật khẩu
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
 *                   example: "/auth/login"
 *                 code:
 *                   type: string
 *                   description: Mã lỗi
 *                   example: "DATA_NOT_FOUND"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Nội dung lỗi
 *                       example: "Tài khoản hoặc mật khẩu không chính xác"
 *       403:
 *         description: Tài khoản bị khóa
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
 *                   example: "/auth/login"
 *                 code:
 *                   type: string
 *                   description: Mã lỗi
 *                   example: "ACCOUNT_IS_BANNED"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Nội dung lỗi
 *                       example: "Tài khoản đã bị khóa"
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
 *                   example: "/auth/login"
 *                 code:
 *                   type: string
 *                   description: Mã lỗi
 *                   example: "ERR_LOGIN_FAILED"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Nội dung lỗi
 *                       example: "Lỗi không xác định từ server"
 */
