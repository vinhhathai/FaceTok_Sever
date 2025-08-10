'use strict';
//----------------------------------------------------------------
const mongoose = require('mongoose');
require('dotenv').config();

class DBConnection {
    async connect() {
        try {
            let connectionString = process.env.DATABASE;
            
            await mongoose.connect(connectionString, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            // debug removed
            return true; // Trả về true nếu kết nối thành công
        } catch (error) {
            console.error('Error while connecting to MongoDB:', error);
            return false; // Trả về false nếu có lỗi
        }
    }
}

module.exports = DBConnection; 