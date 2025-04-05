'use strict';

const UserModel = require("../../models/UserModel");
const { errorCode, errorMessage } = require('../../common/enum/error');
const formatDate = require('../../utils/formatDate')

//----------------------------------------------------------------
exports.getProfile = async (req, res) => {
    // Lấy user_id từ request params thay vì từ token
    const requestedUserId = req.params.id;

    // Check if requestedUserId exists
    if (!requestedUserId) {
        return res.status(400).json({
            timestamp: new Date().toISOString(),
            path: `/user/profile/undefined`,
            code: errorCode.VALIDATION_FAILED,
            error: {
                name: errorMessage.ID_NOT_FOUND
            }
        });
    }

    try {
        // Find User by id from params
        const user = await UserModel.findById(requestedUserId).select('-password -__v'); // Exclude sensitive data
        if (!user) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                path: `/user/profile/${requestedUserId}`,
                code: errorCode.DATA_NOT_FOUND,
                error: {
                    name: errorMessage.USER_NOT_FOUND
                }
            });
        }
        return res.status(200).json({
            timestamp: new Date().toISOString(),
            path: `/user/profile/${requestedUserId}`,
            data: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePicture: user.profilePicture,
                thumbnail: user.thumbnail,
                birthday: formatDate(user.birthday),
                bio: user.bio,
                gender: user.gender,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                location: user.location
            }
        });
    } catch (error) {
        return res.status(500).json({
            timestamp: new Date().toISOString(),
            path: `/user/profile/${requestedUserId}`,
            code: errorCode.ERR_RETRIEVE_PROFILE_FAILED,
            error: {
                name: error.message
            }
        });
    }
};
