'use strict';
//----------------------------------------------------------------

const PostModel = require("../../models/PostModel");
const { errorCode } = require('../../common/enum/error');

//----------------------------------------------------------------
exports.getPost = async (req, res) => {
    const { limit, offset } = req.query;
    const limitNum = parseInt(limit, 10);
    const offsetNum = parseInt(offset, 10);
    const {user_id} = req.user // Get user_id từ middleware

    try {
        let userPosts = [];
      
        // Get all owned posts
        if (user_id) {
            userPosts = await PostModel.find({
                user_id,
                isDelete: { $ne: true }
            })
            .sort({ createdAt: -1 })
            .limit(limitNum ? limitNum : 10)
            .skip(offsetNum ? offsetNum : 0);
        }
  
        // Response data
        res.status(200).json({ data: userPosts });
    } catch (error) {
        return res.status(500).json({
            timestamp: new Date().toISOString(),
            path: "/post/profile",
            code: errorCode.ERR_GET_POST_FAILED,
            error: {
                name: error.message
            }
        });
    }
};
