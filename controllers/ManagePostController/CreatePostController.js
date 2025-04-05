'use strict';

const UserModel = require("../../models/UserModel");
const PostModel = require("../../models/PostModel");
const { errorCode, errorMessage } = require('../../common/enum/error');
const { uploadToCloudinary } = require('../../utils/cloudinaryUpload');

//----------------------------------------------------------------
exports.createNewPost = async (req, res, next) => {
    const { caption } = req.body;
    const file = req.file;
    const { user_id } = req.user;

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

        // Biến lưu trữ URL của file trên Cloudinary
        let fileUrl = "";
        let fileType = "";
        
        // Upload lên Cloudinary nếu có file
        if (file) {
            try {
                // Upload file lên Cloudinary
                const cloudinaryResult = await uploadToCloudinary(file.buffer, {
                    resource_type: 'image', // Chỉ cho phép ảnh
                    folder: 'posts', // Thư mục lưu trữ
                    public_id: `post_${user_id}_${Date.now()}`, // Tên file
                    transformation: [
                        { quality: 'auto' }, // Tự động điều chỉnh chất lượng
                        { fetch_format: 'auto' } // Tự động chọn định dạng tốt nhất
                    ]
                });
                
                fileUrl = cloudinaryResult.secure_url;
                fileType = file.mimetype;
                
                console.log('File uploaded to Cloudinary:', fileUrl);
            } catch (uploadError) {
                console.error('Error uploading to Cloudinary:', uploadError);
                return res.status(500).json({
                    timestamp: new Date().toISOString(),
                    path: "/post/create",
                    code: errorCode.UPLOAD_FILE_FAILED,
                    error: {
                        name: "Failed to upload file to Cloudinary"
                    }
                });
            }
        }

        // Create a new post
        const newPost = new PostModel({
            userId: user_id,
            caption,
            filePath: fileUrl,
            fileType: fileType,
            isDelete: false
        });

        await newPost.save();

        // Add post id to user's posts array
        user.posts.push(newPost._id);
        await user.save();
        
        return res.status(201).json({
            message: 'Post created successfully',
            post: {
                _id: newPost._id,
                content: newPost.caption,
                author: {
                    _id: user._id,
                    fullName: user.fullName,
                    profilePicture: user.profilePicture || ''
                },
                media: fileUrl ? [{ url: fileUrl }] : [],
                likesCount: 0,
                commentsCount: 0,
                createdAt: newPost.createdAt
            }
        });
    } catch (error) {
        console.error('Error creating post:', error);
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
