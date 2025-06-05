"use strict";
const mongoose = require("mongoose");
const RoomModel = require("../models/RoomModel");
const DBConnection = require("../../../shared/database/DBConnection");
require("dotenv").config();

/**
 * Script để chuyển đổi cấu trúc của trường messages
 * từ null thành mảng trống []
 */
async function migrateRooms() {
  try {
    // Kết nối tới MongoDB
    const dbConnection = new DBConnection();
    await dbConnection.connect();
    console.log("MongoDB connected...");

    // Tìm tất cả các phòng có messages là null
    const count = await RoomModel.updateMany(
      { messages: null },
      { $set: { messages: [] } }
    );

    console.log(`Đã cập nhật ${count.modifiedCount} phòng chat.`);
    
    console.log("Migration thành công!");
    process.exit(0);
  } catch (err) {
    console.error("Migration lỗi:", err);
    process.exit(1);
  }
}

// Chạy script
migrateRooms(); 