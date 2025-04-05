"use strict";
//----------------------------------------------------------------
const UserModel = require('../../models/UserModel');

/**
 * Search for users based on query string
 * @param {Object} req - Request object containing query parameter
 * @param {Object} res - Response object
 * @returns {Object} Response with matched users
 */
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Create a regex pattern for case-insensitive matching
    const searchPattern = new RegExp(query, 'i');
    
    // Search for users that match the pattern in fullName or email
    const users = await UserModel.find({
      $or: [
        { fullName: searchPattern },
        { email: searchPattern }
      ]
    }).select('fullName email profilePicture thumbnail');

    return res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error searching users:', error);
    return res.status(500).json({
      success: false,
      message: 'Error searching users'
    });
  }
};

module.exports = {
  searchUsers
}; 