'use strict';
//----------------------------------------------------------------

// Import all validations
const { sendMessageValidation } = require('./messageValidation');
const { createDirectRoomValidation } = require('./directRoomValidation');
const { getRoomsValidation, getRoomDetailsValidation } = require('./roomListValidation');

// Export all validations
module.exports = {
    sendMessageValidation,
    createDirectRoomValidation,
    getRoomsValidation,
    getRoomDetailsValidation
}; 