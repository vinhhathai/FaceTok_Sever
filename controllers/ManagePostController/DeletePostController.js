const PostModel = require('../../models/PostModel');
const UserModel = require('../../models/UserModel');
const { errorCode, errorMessage } = require('../../common/enum/error')

exports.softDeletePost = async (req, res) => {
    const postId = req.params.id; // get id of post from client

    // Check validation postId
    if (!postId) {
        return res.status(400).json({
            timestamp: new Date().toISOString(),
            path: `/post/delete/${postId}`,
            code: errorCode.VALIDATION_FAILED,
            error: {
                name: errorMessage.ID_NOT_FOUND
            }
        });
    }

    // Find post by id
    try {
        const post = await PostModel.findById(postId);
        if (!post) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                path: `/post/delete/${postId}`,
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
            $pull: { posts: postId } // remove posts array where value same as postId
        });

        res.status(200).json({ message: 'Post soft deleted successfully' });
    } catch (error) {
        return res.status(500).json({
            timestamp: new Date().toISOString(),
            path: `/post/delete/${postId}`,
            code: errorCode.ERR_DELETE_POST_FAILED,
            error: {
                name: errorMessage.UNKNOWN_ERROR
            }
        });
    }
};
