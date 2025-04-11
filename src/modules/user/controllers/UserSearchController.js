"use strict";
//----------------------------------------------------------------
const UserSearchService = require('../services/UserSearchService');

class UserSearchController {
    constructor() {
        this.userSearchService = UserSearchService;
    }

    searchPeople = async (req, res) => {
        const { q } = req.query;
        const userId = req.user.id; // Từ middleware authentication
        
        if (!q || q.trim() === '') {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: '/user/search-people',
                error: {
                    code: 'INVALID_INPUT',
                    message: 'Search query is required'
                }
            });
        }
        
        const result = await this.userSearchService.searchUsers(q, userId);
        
        if (result.success) {
            return res.status(result.statusCode).json({
                success: true,
                data: result.data
            });
        } else {
            return res.status(result.statusCode).json({ 
                timestamp: new Date().toISOString(),
                path: '/user/search-people',
                error: result.error 
            });
        }
    }
}

module.exports = new UserSearchController(); 