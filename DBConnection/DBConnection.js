const mongoose = require('mongoose');

module.exports = class DBConnection {
   
    async connect() {
        try {
            let connectionString = 'mongodb://127.0.0.1:27017/faaytok';
            
            await mongoose.connect(connectionString, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('Connected to MongoDB');
            return true; // Trả về true nếu kết nối thành công
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
            return false; // Trả về false nếu có lỗi
        }
    }
}
