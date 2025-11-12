/**
 * Migration script to add termsAcceptance field to existing users
 * Run this script once to update all existing users in the database
 * 
 * Usage: node migrations/add-terms-acceptance.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chaotok', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ Connected to MongoDB');
    runMigration();
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function runMigration() {
  try {
    const User = mongoose.connection.collection('users');
    
    console.log('\n🔄 Starting migration...\n');
    
    // Find all users without termsAcceptance field
    const usersToUpdate = await User.find({
      'termsAcceptance.accepted': { $exists: false }
    }).toArray();
    
    console.log(`📊 Found ${usersToUpdate.length} users to update\n`);
    
    if (usersToUpdate.length === 0) {
      console.log('✅ No users need updating. Migration complete!');
      await mongoose.connection.close();
      process.exit(0);
    }
    
    // Update each user
    let updated = 0;
    let failed = 0;
    
    for (const user of usersToUpdate) {
      try {
        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              termsAcceptance: {
                accepted: true,  // Assume existing users accepted terms
                acceptedAt: user.createdAt || new Date(),  // Use registration date
                version: '1.0',
                ipAddress: null  // Not available for existing users
              }
            }
          }
        );
        updated++;
        console.log(`✅ Updated user: ${user.email}`);
      } catch (err) {
        failed++;
        console.error(`❌ Failed to update user ${user.email}:`, err.message);
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Successfully updated: ${updated} users`);
    console.log(`   ❌ Failed: ${failed} users`);
    console.log(`   📝 Total processed: ${usersToUpdate.length} users\n`);
    
    console.log('✅ Migration completed successfully!');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}
