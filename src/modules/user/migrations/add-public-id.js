/**
 * Migration: Add publicId (UUID) to all users
 * 
 * Purpose: Use UUID instead of MongoDB ObjectId for client-facing operations
 * Security: UUID is random and doesn't expose creation time or sequence
 */

const mongoose = require('mongoose');
require('dotenv').config();

const UserModel = require('../models/UserModel');

async function addPublicIdToUsers() {
  // Dynamic import for uuid (ESM module)
  const { v4: uuidv4 } = await import('uuid');
  
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.DATABASE);
    console.log('✅ Connected to database');

    console.log('🔄 Finding users without publicId...');
    const users = await UserModel.find({ publicId: { $exists: false } });
    console.log(`📊 Found ${users.length} users to update`);

    if (users.length === 0) {
      console.log('✅ All users already have publicId');
      return;
    }

    console.log('🔄 Adding publicId to users...');
    let updated = 0;
    
    for (const user of users) {
      const publicId = uuidv4();
      await UserModel.updateOne(
        { _id: user._id },
        { $set: { publicId: publicId } }
      );
      updated++;
      
      if (updated % 100 === 0) {
        console.log(`   Progress: ${updated}/${users.length}`);
      }
    }

    console.log(`✅ Successfully added publicId to ${updated} users`);
    console.log('✅ Migration completed successfully');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run migration
if (require.main === module) {
  addPublicIdToUsers()
    .then(() => {
      console.log('✅ Migration script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = addPublicIdToUsers;
