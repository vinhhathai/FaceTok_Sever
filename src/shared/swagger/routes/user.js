"use strict";
//----------------------------------------------------------------

/**
 * @swagger
 * tags:
 *   name: User
 *   description: APIs quản lý người dùng
 */

/**
 * @swagger
 * /user/profile/{id}:
 *   get:
 *     summary: Lấy thông tin profile của người dùng
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của người dùng cần xem thông tin
 *     responses:
 *       200:
 *         description: Lấy thông tin profile thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileResponse'
 *       400:
 *         description: ID không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Không có quyền truy cập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Không tìm thấy người dùng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /user/update-avatar-url:
 *   put:
 *     summary: Cập nhật avatar URL của người dùng
 *     description: Cập nhật URL avatar của người dùng đã được upload lên Cloudinary
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - avatarUrl
 *             properties:
 *               avatarUrl:
 *                 type: string
 *                 example: "https://res.cloudinary.com/example/image/upload/v1637132723/avatars/user123.jpg"
 *                 description: URL của avatar đã được upload lên Cloudinary
 *     responses:
 *       200:
 *         description: Cập nhật avatar thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     profilePicture:
 *                       type: string
 *                       example: "https://res.cloudinary.com/example/image/upload/v1637132723/avatars/user123.jpg"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-11-15T10:30:00.000Z"
 *                 message:
 *                   type: string
 *                   example: "Cập nhật avatar thành công"
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Không có quyền truy cập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Không tìm thấy người dùng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /user/update-thumbnail-url:
 *   put:
 *     summary: Cập nhật thumbnail URL của người dùng
 *     description: Cập nhật URL thumbnail (ảnh bìa) của người dùng đã được upload lên Cloudinary
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - thumbnailUrl
 *             properties:
 *               thumbnailUrl:
 *                 type: string
 *                 example: "https://res.cloudinary.com/example/image/upload/v1637132723/thumbnails/user123.jpg"
 *                 description: URL của thumbnail đã được upload lên Cloudinary
 *     responses:
 *       200:
 *         description: Cập nhật thumbnail thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     thumbnail:
 *                       type: string
 *                       example: "https://res.cloudinary.com/example/image/upload/v1637132723/thumbnails/user123.jpg"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-11-15T10:30:00.000Z"
 *                 message:
 *                   type: string
 *                   example: "Cập nhật thumbnail thành công"
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Không có quyền truy cập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Không tìm thấy người dùng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */ 