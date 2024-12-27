'use strict';

const UserModel = require("../../models/UserModel");
const PostModel = require("../../models/PostModel");
const { errorCode, errorMessage } = require('../../common/enum/error');

exports.updatePost = async (req, res, next) => {
    const { post_id, caption } = req.body;
    const { user_id } = req.user;
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

    // Find post by id
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

        // Ensure the post belongs to the user making the request
        if (post.user_id.toString() !== user_id) {
            return res.status(403).json({
                timestamp: new Date().toISOString(),
                path: req.originalUrl,
                code: errorCode.NOT_PERMISSIONS,
                error: {
                    name: errorMessage.NOT_PERMISSIONS
                }
            });
        }

        // Update caption and file
        if (caption) {
            post.caption = caption;
        }

        if (file) {
            post.filePath = `${req.protocol}://${req.get('host')}/upload/${file.filename}`;
            post.fileType = file.mimetype;
        }

        await post.save();

        res.status(200).json({ message: 'Post updated successfully' });
    } catch (error) {
        res.status(500).json({
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
            code: errorCode.ERR_UPDATE_POST_FAILED,
            error: {
                name: error.message
            }
        });
    }
};
