'use strict';

const UserModel = require("../../models/UserModel");
const { errorCode, errorMessage } = require('../../common/enum/error');

//----------------------------------------------------------------
exports.updateProfile = async (req, res) => {
    const { user_id } = req.user; // Lấy user_id từ thông tin đăng nhập
    const { bio, fullName, gender, location, birthday } = req.body; // Lấy thông tin từ request body

    // Check if user_id exists
    if (!user_id) {
        return res.status(400).json({
            timestamp: new Date().toISOString(),
            path: `/user/update-profile/${user_id}`,
            code: errorCode.VALIDATION_FAILED,
            error: {
                name: errorMessage.ID_NOT_FOUND,
            },
        });
    }

    try {
        // Tìm user theo id
        const user = await UserModel.findById(user_id);
        if (!user) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                path: `/user/update-profile/${user_id}`,
                code: errorCode.DATA_NOT_FOUND,
                error: {
                    name: errorMessage.USER_NOT_FOUND,
                },
            });
        }

        // Chỉ cập nhật những trường có trong request body
        if (bio !== undefined) user.bio = bio;
        if (fullName !== undefined) user.fullName = fullName;
        if (gender !== undefined) user.gender = gender;
        if (location !== undefined) user.location = location;
        if (birthday !== undefined) user.birthday = new Date(birthday);

        // Lưu lại thông tin sau khi cập nhật
        await user.save();

        // Format ngày sinh trước khi trả về
        const formattedBirthday = user.birthday ? user.birthday.toISOString().split('T')[0] : null;

        return res.status(200).json({
            timestamp: new Date().toISOString(),
            path: `/user/update-profile/${user_id}`,
            message: "Profile updated successfully",
            data: {
                id: user._id,
                fullName: user.fullName,
                bio: user.bio,
                gender: user.gender,
                location: user.location,
                birthday: formattedBirthday,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        return res.status(500).json({
            timestamp: new Date().toISOString(),
            path: `/user/update-profile/${user_id}`,
            code: errorCode.ERR_UPDATE_PROFILE_FAILED,
            error: {
                name: error.message,
            },
        });
    }
};

// Hàm riêng cho việc cập nhật tên người dùng
exports.updateFullName = async (req, res) => {
    const { user_id } = req.user;
    const { fullName } = req.body;

    // Kiểm tra user_id
    if (!user_id) {
        return res.status(400).json({
            timestamp: new Date().toISOString(),
            path: `/user/update-fullname`,
            code: errorCode.VALIDATION_FAILED,
            error: {
                name: errorMessage.ID_NOT_FOUND,
            },
        });
    }

    // Kiểm tra fullName
    if (!fullName || fullName.trim() === '') {
        return res.status(400).json({
            timestamp: new Date().toISOString(),
            path: `/user/update-fullname`,
            code: errorCode.VALIDATION_FAILED,
            error: {
                name: "Tên không được để trống",
            },
        });
    }

    try {
        // Tìm user theo id
        const user = await UserModel.findById(user_id);
        if (!user) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                path: `/user/update-fullname`,
                code: errorCode.DATA_NOT_FOUND,
                error: {
                    name: errorMessage.USER_NOT_FOUND,
                },
            });
        }

        // Kiểm tra thời gian cập nhật tên lần cuối
        const lastNameUpdateTime = user.lastNameUpdateTime || new Date(0); // Nếu chưa có, lấy thời điểm 0
        const currentTime = new Date();
        const timeDiffMinutes = Math.floor((currentTime - lastNameUpdateTime) / (1000 * 60));
        
        // Kiểm tra xem đã đủ 60 phút kể từ lần đổi tên gần nhất chưa
        if (timeDiffMinutes < 60) {
            const timeRemaining = 60 - timeDiffMinutes;
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: `/user/update-fullname`,
                code: errorCode.VALIDATION_FAILED,
                error: {
                    name: `Bạn cần đợi thêm ${timeRemaining} phút nữa để đổi tên`,
                    timeRemaining: timeRemaining
                },
            });
        }

        // Cập nhật tên mới
        user.fullName = fullName;
        // Cập nhật thời gian đổi tên
        user.lastNameUpdateTime = currentTime;
        
        // Lưu lại thông tin sau khi cập nhật
        await user.save();

        return res.status(200).json({
            timestamp: new Date().toISOString(),
            path: `/user/update-fullname`,
            message: "Đã cập nhật tên thành công",
            data: {
                id: user._id,
                fullName: user.fullName,
                lastNameUpdateTime: user.lastNameUpdateTime,
                nextNameUpdateAvailable: new Date(user.lastNameUpdateTime.getTime() + 60 * 60 * 1000),
            },
        });
    } catch (error) {
        return res.status(500).json({
            timestamp: new Date().toISOString(),
            path: `/user/update-fullname`,
            code: errorCode.ERR_UPDATE_PROFILE_FAILED,
            error: {
                name: error.message,
            },
        });
    }
};
