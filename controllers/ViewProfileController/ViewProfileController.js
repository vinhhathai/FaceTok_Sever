'use strict';

const UserModel = require("../../models/UserModel");
const { errorCode, errorMessage } = require('../../common/enum/error');

//----------------------------------------------------------------
exports.getProfile = async (req, res) => {
    const { user_id } = req.user;

    // Check if user_id exists
    if (!user_id) {
        return res.status(400).json({
            timestamp: new Date().toISOString(),
            path: `/user/profile${user_id}`,
            code: errorCode.VALIDATION_FAILED,
            error: {
                name: errorMessage.ID_NOT_FOUND
            }
        });
    }

    try {
        // Find User by id
        const user = await UserModel.findById(user_id).select('-password -__v'); // Exclude sensitive data
        if (!user) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                path: `/user/profile/${user.id}`,
                code: errorCode.DATA_NOT_FOUND,
                error: {
                    name: errorMessage.USER_NOT_FOUND
                }
            });
        }

        return res.status(200).json({
            timestamp: new Date().toISOString(),
            path: `/user/profile/${user.id}`,
            data: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePicture: user.profilePicture,
                thumbnailL: user.thumbnail,
                birthday: user.birthday,
                bio: user.bio,
                gender: user.gender,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }
        });
    } catch (error) {
        return res.status(500).json({
            timestamp: new Date().toISOString(),
            path: `/user/profile/${user.id}`,
            code: errorCode.ERR_RETRIEVE_PROFILE_FAILED,
            error: {
                name: error.message
            }
        });
    }
};
