'use strict';
//----------------------------------------------------------------
const app = require('./app');
const http = require('http');
const socketIo = require('socket.io');
const MessageSocket = require('./modules/message/socket/MessageSocket');
require('dotenv').config();

// Get port from environment or use default port 3000
const port = process.env.PORT || 3000;
app.set('port', port);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
    cors: {
        origin: process.env.SOCKET_CLIENT_URL || "http://localhost:3001",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Initialize message socket handler
const messageSocket = new MessageSocket(io);
messageSocket.init();

// Start the server
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

// Handle error events
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // Display specific error messages
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

// When server is ready to listen
function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
    console.log(`Chaotok server running at http://localhost:${port}`);
} 