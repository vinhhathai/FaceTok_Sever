'use strict';

const UserModel = require("../../models/UserModel");
const { errorCode, errorMessage } = require('../../common/enum/error');

//----------------------------------------------------------------
exports.getFriends = async (req, res) => {
    const { user_id } = req.user;

    // Check user_id
    if (!user_id) {
        return res.status(400).json({
            timestamp: new Date().toISOString(),
            path: "/user/friends",
            code: errorCode.VALIDATION_FAILED,
            error: {
                name: errorMessage.ID_NOT_FOUND
            }
        });
    }

    try {
        // Find User by id
        const user = await UserModel.findById(user_id).select('friends');
        if (!user) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                path: "/user/friends",
                code: errorCode.DATA_NOT_FOUND,
                error: {
                    name: errorMessage.USER_NOT_FOUND
                }
            });
        }

        return res.status(200).json({
            data: user.friends
        });
    } catch (error) {
        return res.status(500).json({
            timestamp: new Date().toISOString(),
            path: "/user/friends",
            code: errorCode.ERR_RETRIEVE_FRIENDS_FAILED,
            error: {
                name: error.message
            }
        });
    }
}
