
const UserModel = require('../models/UserModel');
exports.getHome = async (req, res, next) => {
    // try {
    //     const data = await UserModel.find({}) // Chờ cho truy vấn hoàn tất

    //     res.json({ users: data });
    // } catch (err) {
    //     console.error(err);
    //     res.status(500).json({ error: 'Internal Server Error' });
    // }
    try {
        return res.status(200).json({
            status: 'OK Home'
        })
    } catch (error) {
        return res.json({
            errorName: error.name,
            errorMessage: error.message
        });
    }
}

//---------------------------------------------------------------------------
exports.searchUser = async (req, res) => {

    const query = req.query.username;

    try {
        // Tìm kiếm người dùng dựa trên query
        const users = await UserModel.find({
            $or: [
                { username: { $regex: query, $options: 'i' } }, // Tìm theo tên người dùng
                { fullName: { $regex: query, $options: 'i' } } // Tìm theo tên đầy đủ
            ]
        });

        res.json({ users });
    } catch (error) {
        console.error('Error searching users:', error);
        return res.json({
            errorName: error.name,
            errorMessage: error.message
        });
    }
}



