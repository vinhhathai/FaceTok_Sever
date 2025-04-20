'use strict';
//----------------------------------------------------------------
const app = require('./app');
const http = require('http');
const SocketService = require('./shared/services/SocketService');
require('dotenv').config();

// Lấy port từ biến môi trường hoặc sử dụng port 3000 mặc định
const port = process.env.PORT || 3000;
app.set('port', port);

// Tạo HTTP server
const server = http.createServer(app);

// Khởi tạo Socket.IO
SocketService.initialize(server);

// Khởi chạy server
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

// Xử lý sự kiện lỗi
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // Hiển thị thông báo lỗi cụ thể
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

// Khi server đã sẵn sàng lắng nghe
function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
    console.log(`FaceTok server running at http://localhost:${port}`);
} 