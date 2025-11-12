// Script to update user role to admin
// Run this in MongoDB shell or MongoDB Compass

// Replace 'your-email@example.com' with your actual email
db.users.updateOne(
  { email: "your-email@example.com" },
  { 
    $set: { 
      role: "admin",
      isActive: true,
      isEmailVerified: true
    } 
  }
)

// Or update by user ID
// db.users.updateOne(
//   { _id: ObjectId("your-user-id-here") },
//   { 
//     $set: { 
//       role: "admin",
//       isActive: true,
//       isEmailVerified: true
//     } 
//   }
// )

// Check result
db.users.find({ email: "your-email@example.com" }).pretty()
