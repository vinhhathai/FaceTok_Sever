'use strict';

const UserModel = require("../../models/UserModel");
const { errorCode, errorMessage } = require('../../common/enum/error');

//----------------------------------------------------------------
exports.updateProfile = async (req, res) => {
    const { user_id } = req.user; // Lấy user_id từ thông tin đăng nhập
    const { bio, fullName, gender } = req.body; // Lấy thông tin từ request body

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

        // Lưu lại thông tin sau khi cập nhật
        await user.save();

        return res.status(200).json({
            timestamp: new Date().toISOString(),
            path: `/user/update-profile/${user_id}`,
            message: "Profile updated successfully",
            data: {
                id: user._id,
                fullName: user.fullName,
                bio: user.bio,
                gender: user.gender,
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
