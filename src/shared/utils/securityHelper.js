/**
 * Security Helper: Convert internal MongoDB _id to client-safe ID
 * 
 * We standardize to MongoDB ObjectId string for all client-facing operations.
 */

/**
 * Get client-facing user ID from user object
 * @param {Object} user - User document from database
 * @returns {String} - MongoDB ObjectId as string
 */
const getPublicUserId = (user) => {
  if (!user) return null;
  return user._id?.toString() || null;
};

/**
 * Sanitize user object for client response
 * Removes sensitive fields and uses ObjectId
 * @param {Object} user - User document
 * @param {Object} options - Additional options
 * @returns {Object} - Sanitized user object
 */
const sanitizeUser = (user, options = {}) => {
  if (!user) return null;
  
  const sanitized = {
    id: getPublicUserId(user),
    email: options.includeEmail !== false ? user.email : undefined,
    fullName: user.fullName,
    profilePicture: user.profilePicture || null,
    thumbnail: user.thumbnail || null,
    role: options.includeRole !== false ? user.role : undefined,
  };
  
  // Remove undefined fields
  Object.keys(sanitized).forEach(key => 
    sanitized[key] === undefined && delete sanitized[key]
  );
  
  return sanitized;
};

/**
 * Sanitize array of users
 * @param {Array} users - Array of user documents
 * @param {Object} options - Additional options
 * @returns {Array} - Array of sanitized user objects
 */
const sanitizeUsers = (users, options = {}) => {
  if (!Array.isArray(users)) return [];
  return users.map(user => sanitizeUser(user, options));
};

module.exports = {
  getPublicUserId,
  sanitizeUser,
  sanitizeUsers
};
