'use strict';
//----------------------------------------------------------------
const mongoose = require('mongoose');
const logger = require('../utils/logger');
require('dotenv').config();

class DBConnection {
    async connect() {
        try {
            let connectionString = process.env.DATABASE;
            
            // Remove deprecated options - they have no effect in MongoDB Driver v4.0.0+
            await mongoose.connect(connectionString);
            
            logger.info('Successfully connected to MongoDB');
            return true; // Trả về true nếu kết nối thành công
        } catch (error) {
            logger.error('Error while connecting to MongoDB:', { error: error.message, stack: error.stack });
            return false; // Trả về false nếu có lỗi
        }
    }
}

module.exports = DBConnection; 