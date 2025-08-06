/**
 * Script để migrate schema của room từ kiểu cũ (members chứa user object) sang kiểu mới (members chứa ObjectId)
 */
'use strict';

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chaotok')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Schema cũ
const OldRoomSchema = new mongoose.Schema({
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    }
  }],
  isGroup: Boolean
}, { timestamps: true });

// Schema mới
const NewRoomSchema = new mongoose.Schema({
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  }],
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'groups',
    unique: true
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'messages',
    default: null
  }
}, { timestamps: true });

// Model cũ
const OldRoom = mongoose.model('old_rooms', OldRoomSchema, 'rooms');

// Model mới (sẽ thay thế collection cũ)
const NewRoom = mongoose.model('new_rooms', NewRoomSchema, 'rooms_new');

// Function để migrate data
async function migrateRooms() {
  try {
    // Lấy tất cả room từ collection cũ
    const oldRooms = await OldRoom.find({});
    console.log(`Found ${oldRooms.length} rooms to migrate`);

    // Tạo mảng để lưu các room mới
    const newRooms = [];

    // Chuyển đổi từng room
    for (const oldRoom of oldRooms) {
      // Chuyển đổi member từ kiểu cũ sang kiểu mới
      const members = oldRoom.members.map(member => member.user);

      // Tạo room mới
      const newRoom = new NewRoom({
        _id: oldRoom._id, // Giữ nguyên _id
        members: members,
        // Bỏ isGroup field, chỉ giữ groupId nếu cần
        createdAt: oldRoom.createdAt,
        updatedAt: oldRoom.updatedAt
      });

      newRooms.push(newRoom);
    }

    // Xóa tất cả dữ liệu trong collection mới (nếu có)
    await NewRoom.deleteMany({});

    // Lưu các room mới vào database
    if (newRooms.length > 0) {
      await NewRoom.insertMany(newRooms);
      console.log(`Successfully migrated ${newRooms.length} rooms`);
    } else {
      console.log('No rooms to migrate');
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Đóng kết nối database
    mongoose.connection.close();
  }
}

// Chạy migration
migrateRooms(); 