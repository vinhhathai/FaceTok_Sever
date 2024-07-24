'use strict';

const UserModel = require("../../models/UserModel");
const PostModel = require("../../models/PostModel");
const { errorCode, errorMessage } = require('../../common/enum/error');

//----------------------------------------------------------------
exports.updatePost = async (req, res, next) => {
    const { post_id, user_id, caption } = req.body;
    const file = req.file;

    if (!post_id) {
        return res.status(400).json({
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
            code: errorCode.VALIDATION_FAILED,
            error: {
                name: errorMessage.ID_NOT_FOUND
            }
        });
    }

    try {
        const post = await PostModel.findById(post_id);
        if (!post) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                path: req.originalUrl,
                code: errorCode.DATA_NOT_FOUND,
                error: {
                    name: errorMessage.POST_NOT_FOUND
                }
            });
        }

        if (user_id) {
            const user = await UserModel.findById(user_id);
            if (!user) {
                return res.status(404).json({
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl,
                    code: errorCode.DATA_NOT_FOUND,
                    error: {
                        name: errorMessage.USER_NOT_FOUND
                    }
                });
            }
            post.user_id = user_id;
        }

        if (caption) {
            post.caption = caption;
        }

        if (file) {
            post.filePath = `${req.protocol}://${req.get('host')}/upload/${file.filename}`;
            post.fileType = file.mimetype;
        } else {
            post.filePath = ""
            post.fileType = ""
        }

        await post.save();

        res.status(200).json({ message: 'Post updated successfully'});
    } catch (error) {
        res.status(500).json({
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
            code: errorCode.ERR_UPDATE_POST_FAILED,
            error: {
                name: errorMessage.UNKNOWN_ERROR
            }
        });
    }
};
