// Script to update user to admin role
// Run: node make-admin-script.js <email>

const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  email: String,
  role: String,
  isActive: Boolean,
  isEmailVerified: Boolean,
  fullName: String,
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

async function makeAdmin(email) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/facetok', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.error(`❌ User not found with email: ${email}`);
      process.exit(1);
    }

    console.log('Found user:', {
      email: user.email,
      fullName: user.fullName,
      currentRole: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
    });

    // Update to admin
    await User.updateOne(
      { email },
      {
        $set: {
          role: 'admin',
          isActive: true,
          isEmailVerified: true,
        },
      }
    );

    console.log('✅ User updated successfully!');
    
    // Verify update
    const updatedUser = await User.findOne({ email });
    console.log('Updated user:', {
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      isEmailVerified: updatedUser.isEmailVerified,
    });

    await mongoose.connection.close();
    console.log('Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Get email from command line
const email = process.argv[2];

if (!email) {
  console.error('Usage: node make-admin-script.js <email>');
  console.error('Example: node make-admin-script.js admin@example.com');
  process.exit(1);
}

makeAdmin(email);
