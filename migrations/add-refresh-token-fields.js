/**
 * Migration: Add refreshToken and refreshTokenExpiry fields to User collection
 * 
 * Purpose: Support refresh token functionality for enhanced security
 * 
 * Run: node migrations/add-refresh-token-fields.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Run migration
const runMigration = async () => {
  try {
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find users without refreshToken field
    const usersToUpdate = await usersCollection
      .find({
        refreshToken: { $exists: false }
      })
      .toArray();

    console.log(`\n📊 Found ${usersToUpdate.length} users to update`);

    if (usersToUpdate.length === 0) {
      console.log('✅ All users already have refreshToken fields');
      return;
    }

    // Update users with new fields
    const result = await usersCollection.updateMany(
      { refreshToken: { $exists: false } },
      {
        $set: {
          refreshToken: null,
          refreshTokenExpiry: null
        }
      }
    );

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`   - Matched: ${result.matchedCount} users`);
    console.log(`   - Modified: ${result.modifiedCount} users`);
    console.log(`\n📝 Note: Existing users will need to login again to get refresh tokens`);

  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  console.log('🚀 Starting Refresh Token Fields Migration...\n');
  
  await connectDB();
  await runMigration();
  
  console.log('\n✅ Migration finished. Closing connection...');
  await mongoose.connection.close();
  console.log('👋 Disconnected from MongoDB\n');
};

// Run
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
