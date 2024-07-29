'use strict';

const UserModel = require("../../models/UserModel");
const { errorCode, errorMessage } = require('../../common/enum/error');

//----------------------------------------------------------------
exports.removeFriend = async (req, res) => {
    const { friend_id } = req.body;
    const { user_id } = req.user;

    // Check user_id
    if (!user_id) {
        return res.status(400).json({
            timestamp: new Date().toISOString(),
            path: "/user/remove-friend",
            code: errorCode.VALIDATION_FAILED,
            error: {
                name: errorMessage.ID_NOT_FOUND
            }
        });
    }

    try {
        // Find User by id
        const user = await UserModel.findById(user_id);
        if (!user) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                path: "/user/remove-friend",
                code: errorCode.DATA_NOT_FOUND,
                error: {
                    name: errorMessage.USER_NOT_FOUND
                }
            });
        }

        // Find Friend by id
        const friend = await UserModel.findById(friend_id);
        if (!friend) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                path: "/user/remove-friend",
                code: errorCode.DATA_NOT_FOUND,
                error: {
                    name: errorMessage.USER_NOT_FOUND
                }
            });
        }

        // Check if friend exists in user's friends list
        if (!user.friends.includes(friend_id) || !friend.friends.includes(user_id)) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: "/user/remove-friend",
                code: errorCode.VALIDATION_FAILED,
                error: {
                    name: errorMessage.USER_NOT_FOUND
                }
            });
        }

        // Remove friend from both users' friends list
        user.friends = user.friends.filter(id => id.toString() !== friend_id.toString());
        friend.friends = friend.friends.filter(id => id.toString() !== user_id.toString());

        // Save both users
        await user.save();
        await friend.save();

        return res.status(200).json({
            message: 'Friend removed successfully'
        });
    } catch (error) {
        return res.status(500).json({
            timestamp: new Date().toISOString(),
            path: "/user/remove-friend",
            code: errorCode.ERR_REMOVE_FRIEND_FAILED,
            error: {
                name: error.message
            }
        });
    }
}
