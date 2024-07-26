'use strict';

const UserModel = require("../../models/UserModel");
const PostModel = require("../../models/PostModel");
const { errorCode, errorMessage } = require('../../common/enum/error')


//----------------------------------------------------------------
exports.createNewPost = async (req, res, next) => {
    const { user_id, caption  } = req.body;
    const file = req.file;

    console.log(req.body)

    // Check user_id
    if (!user_id) {
        return res.status(400).json({
            timestamp: new Date().toISOString(),
            path: "/post/create",
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
                path: "/post/create",
                code: errorCode.DATA_NOT_FOUND,
                error: {
                    name: errorMessage.USER_NOT_FOUND
                }
            });
        }

        //Get file url and file type
        const fileUrl = file ? `${req.protocol}://${req.get('host')}/upload/${file.filename}` : "";
        const fileType = file ? file.mimetype : "";

        //Create a new post
        const newPost = new PostModel({
            user_id,
            caption,
            filePath: fileUrl,
            fileType: fileType,
            isDelete: false
        });

        await newPost.save();

        //Add post id to user's posts array
        user.posts.push(newPost._id);
        await user.save();
        return res.status(201).json({
            message: 'Post created successfully'
        });
    } catch (error) {
        return res.status(500).json({
            timestamp: new Date().toISOString(),
            path: "/post/create",
            code: errorCode.ERR_CREATE_POST_FAILED,
            error: {
                name: error.message
            }
        });
    }
}
