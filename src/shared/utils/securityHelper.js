/**
 * Security Helper: Convert internal MongoDB _id to public UUID
 * 
 * Purpose: Never expose internal database IDs to clients
 * Use publicId (UUID) for all client-facing operations
 */

/**
 * Get public ID from user object
 * @param {Object} user - User document from database
 * @returns {String} - Public UUID or fallback to _id during migration
 */
const getPublicUserId = (user) => {
  if (!user) return null;
  
  // Prefer publicId (UUID) over internal _id
  return user.publicId || user._id?.toString();
};

/**
 * Sanitize user object for client response
 * Removes sensitive fields and uses publicId
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
