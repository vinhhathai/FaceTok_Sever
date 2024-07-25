'use strict';

const PostModel = require("../../models/PostModel");
const { errorCode } = require('../../common/enum/error');

//----------------------------------------------------------------
exports.getPost = async (req, res, next) => {
    const { user_id, limit, offset } = req.query;
    const limitNum = parseInt(limit, 10);
    const offsetNum = parseInt(offset, 10);
  
    try {
        let userPosts = [];
      
        // get own posts in last 10 minutes
        if (user_id) {
            userPosts = await PostModel.find({
                user_id,
                createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
                isDelete: { $ne: true }
            })
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip(offsetNum);
        }
      
        // Get posts other
        const otherPosts = await PostModel.aggregate([
            { $match: { user_id: { $ne: user_id || "" }, isDelete: { $ne: true } } },
            { $sample: { size: limitNum } },
            { $skip: offsetNum }
        ]);
  
        // Response data
        const combinedPosts = [...userPosts, ...otherPosts];
  
        res.json({ data: combinedPosts });
    } catch (error) {
        return res.status(500).json({
            timestamp: new Date().toISOString(),
            path: "/post/home",
            code: errorCode.ERR_GET_POST_FAILED,
            error: {
                name: error.message
            }
        });
    }
};
