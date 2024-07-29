'use strict';

const UserModel = require("../../models/UserModel");
const { errorCode, errorMessage } = require('../../common/enum/error');

//----------------------------------------------------------------
exports.addFriend = async (req, res) => {
    const { friend_id } = req.body;
    const { user_id } = req.user;

    // Check user_id
    if (!user_id) {
        return res.status(400).json({
            timestamp: new Date().toISOString(),
            path: "/user/add-friend",
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
                path: "/user/add-friend",
                code: errorCode.DATA_CONFLICT,
                error: {
                    name: errorMessage.USER_NOT_FOUND
                }
            });
        }

         // Check if user trying to add himself as friend
         if (user_id === friend_id) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: "/user/add-friend",
                code: errorCode.VALIDATION_FAILED,
                error: {
                    name: errorMessage.ID_CONFLICT
                }
            });
        }

        // Find Friend by id
        const friend = await UserModel.findById(friend_id);
        if (!friend) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                path: "/user/add-friend",
                code: errorCode.DATA_NOT_FOUND,
                error: {
                    name: errorMessage.USER_NOT_FOUND
                }
            });
        }

        // Check if friend already added for both users
        if (user.friends.includes(friend_id) || friend.friends.includes(user_id)) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: "/user/add-friend",
                code: errorCode.VALIDATION_FAILED,
                error: {
                    name: errorMessage.FRIEND_ALREADY_ADDED
                }
            });
        }

        // Add friend to both users
        user.friends.push(friend_id);
        friend.friends.push(user_id);

        // Save both users
        await user.save();
        await friend.save();

        return res.status(201).json({
            message: 'Friends added successfully'
        });
    } catch (error) {
        return res.status(500).json({
            timestamp: new Date().toISOString(),
            path: "/user/add-friend",
            code: errorCode.ERR_ADD_FRIEND_FAILED,
            error: {
                name: error.message
            }
        });
    }
}
