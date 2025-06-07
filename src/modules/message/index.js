'use strict';
//----------------------------------------------------------------
const messageRoutes = require('./api/routes');
const MessageSocket = require('./socket/MessageSocket');
const { RoomDto, MessageDto } = require('./dtos');

// Export message module components
module.exports = {
    routes: messageRoutes,
    MessageSocket,
    dtos: {
        RoomDto,
        MessageDto
    }
}; 