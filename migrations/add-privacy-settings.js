/**
 * Migration: Add Privacy Settings to Users
 * Run: node migrations/add-privacy-settings.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const UserModel = require('../src/modules/user/models/UserModel');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/facetok';

async function addPrivacySettings() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all users without privacy settings
    const users = await UserModel.find({
      showPersonalInfo: { $exists: false }
    });

    console.log(`📊 Found ${users.length} users without privacy settings`);

    if (users.length === 0) {
      console.log('✅ All users already have privacy settings');
      process.exit(0);
    }

    // Update users with default privacy setting (show all info by default)
    let updated = 0;
    for (const user of users) {
      await UserModel.updateOne(
        { _id: user._id },
        { 
          $set: { 
            showPersonalInfo: true 
          } 
        }
      );
      updated++;
      
      if (updated % 100 === 0) {
        console.log(`⏳ Updated ${updated}/${users.length} users...`);
      }
    }

    console.log(`✅ Successfully added privacy settings to ${updated} users`);
    console.log('🎉 Migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run migration
addPrivacySettings();
