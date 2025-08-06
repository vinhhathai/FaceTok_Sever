'use strict';
//----------------------------------------------------------------

// Import all validations
const { sendMessageValidation } = require('./messageValidation');
const { createDirectRoomValidation } = require('./directRoomValidation');
const { getRoomsValidation, getRoomDetailsValidation, getRoomByIdValidation } = require('./roomListValidation');
const { createGroupValidation, getGroupByIdValidation, renameGroupValidation } = require('./groupValidation');

// Export all validations
module.exports = {
    sendMessageValidation,
    createDirectRoomValidation,
    getRoomsValidation,
    getRoomDetailsValidation,
    getRoomByIdValidation,
    createGroupValidation,
    getGroupByIdValidation,
    renameGroupValidation
}; 