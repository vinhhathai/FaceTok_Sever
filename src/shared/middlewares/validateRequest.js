'use strict';
//----------------------------------------------------------------
const { errorCode, errorMessage } = require('../common/error');

/**
 * Middleware to validate request data against a Joi schema
 * @param {Object} schema - Joi schema to validate against
 * @param {String} property - Request property to validate (body, params, query)
 * @returns {Function} Express middleware
 */
const validateRequest = (schema, property = 'body') => {
    return async (req, res, next) => {
        try {
            const value = await schema.validate(req[property], { abortEarly: false });
            req[property] = value;
            next();
        } catch (error) {
            // Build path from request
            const path = req.originalUrl || req.path;
            
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: path,
                error: {
                    code: errorCode.VALIDATION_FAILED,
                    message: error.details.map(detail => detail.message).join(', ')
                }
            });
        }
    };
};

module.exports = validateRequest; 