'use strict';
//----------------------------------------------------------------
const PostModel = require('../../models/PostModel');
const UserModel = require('../../models/UserModel');
const { errorCode, errorMessage } = require('../../common/enum/error')

exports.softDeletePost = async (req, res) => {
    const post_id = req.params.id; // get id of post from client

    // Check validation post_id
    if (!post_id) {
        return res.status(400).json({
            timestamp: new Date().toISOString(),
            path: `/post/delete/${post_id}`,
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
                path: `/post/delete/${post_id}`,
                code: errorCode.DATA_NOT_FOUND,
                error: {
                    name: errorMessage.POST_NOT_FOUND
                }
            });
        }

        // soft delete by update isDelete to TRUE
        post.isDelete = true;
        await post.save();

        // Update the post[] at UserModel (users collection)
        await UserModel.findByIdAndUpdate(post.user_id, { //find user with id same as post.user_id
            $pull: { posts: post_id } // remove posts array where value same as post_id
        });

        res.status(200).json({ message: 'Post soft deleted successfully' });
    } catch (error) {
        return res.status(500).json({
            timestamp: new Date().toISOString(),
            path: `/post/delete/${post_id}`,
            code: errorCode.ERR_DELETE_POST_FAILED,
            error: {
                name: error.message
            }
        });
    }
};
