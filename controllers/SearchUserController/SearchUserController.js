'use strict';
const { errorCode, errorMessage } = require('../../common/enum/error');
//---------------------------------------------------------------------------
exports.searchUser = async (req, res) => {
    const query = req.query.query;

    // Check query parameters
    if (!query || typeof query !== 'string' || query.trim() === '') {
        return res.status(400).json({
            timestamp: new Date().toISOString(),
            path: "/user/search-people",
            code: errorCode.VALIDATION_FAILED,
            error: {
                name: errorMessage.ERR_INVALID_QUERY
            }
        });
    }

    try {
        // Escape query to prevent regex errors
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Find user by query string, just return _id
        const users = await UserModel.find({
            $or: [
                { username: { $regex: escapedQuery, $options: 'i' } }, // Find by username
                { fullName: { $regex: escapedQuery, $options: 'i' } }  // Find by fullname
            ]
        }, '_id'); // just select _id

        // Return array of user_id
        res.status(200).json({ data: users.map(user => user._id) });
    } catch (error) {
        return res.status(500).json({
            timestamp: new Date().toISOString(),
            path: "/user/search-people",
            code: errorCode.ERR_GET_DATA_FAILED,
            error: {
                name: error.message,
            }
        });
    }
};




