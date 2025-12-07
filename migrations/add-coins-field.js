/**
 * Migration: Add coins field to existing users
 * Run: node migrations/add-coins-field.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('users', UserSchema);

async function migrate() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Add coins field to all users who don't have it
    const result = await User.updateMany(
      { coins: { $exists: false } },
      { $set: { coins: 0 } }
    );

    console.log(`✅ Migration completed!`);
    console.log(`   - Updated ${result.modifiedCount} users`);
    console.log(`   - Matched ${result.matchedCount} users`);

    await mongoose.connection.close();
    console.log('✅ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
