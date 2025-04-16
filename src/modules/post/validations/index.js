'use strict';
//----------------------------------------------------------------

// Import all validations
const { 
    createPostValidation,
    updatePostValidation,
    createCommentValidation
} = require('./postValidation');

// Export all validations
module.exports = {
    createPostValidation,
    updatePostValidation,
    createCommentValidation
}; 