"use strict";
//----------------------------------------------------------------
const UserRepository = require('../repositories/UserRepository');

class UserSearchService {
    async searchUsers(query, currentUserId) {
        try {
            // Tìm kiếm người dùng dựa trên query
            const users = await UserRepository.search(query);
            
            // Loại bỏ người dùng hiện tại khỏi kết quả tìm kiếm
            const filteredUsers = users.filter(user => user._id.toString() !== currentUserId);
            
            // Định dạng lại dữ liệu để trả về
            const formattedUsers = filteredUsers.map(user => ({
                id: user._id,
                username: user.username,
                fullName: user.profile.fullName,
                profilePicture: user.profile.profilePicture,
                thumbnail: user.profile.thumbnail
            }));
            
            // Trả về kết quả thành công
            return {
                success: true,
                statusCode: 200,
                data: {
                    users: formattedUsers
                }
            };
        } catch (error) {
            console.error('Error searching users:', error);
            return createErrorResponse(500, 'INTERNAL_SERVER_ERROR', 'Failed to search users');
        }
    }
}

module.exports = new UserSearchService(); 