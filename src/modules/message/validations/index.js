'use strict';
//----------------------------------------------------------------

// Import all validations
const { sendMessageValidation, revokeMessageValidation } = require('./messageValidation');
const { createDirectRoomValidation } = require('./directRoomValidation');
const { getRoomsValidation, getRoomDetailsValidation, getRoomByIdValidation } = require('./roomListValidation');
const { createGroupValidation, getGroupByIdValidation, renameGroupValidation, leaveGroupValidation, kickOutMemberValidation } = require('./groupValidation');

// Export all validations
module.exports = {
    sendMessageValidation,
    createDirectRoomValidation,
    getRoomsValidation,
    getRoomDetailsValidation,
    getRoomByIdValidation,
    createGroupValidation,
    getGroupByIdValidation,
  renameGroupValidation,
  leaveGroupValidation,
  kickOutMemberValidation
  ,
  revokeMessageValidation
}; 