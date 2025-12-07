/**
 * Migration: Fix duplicate key error in likes collection
 * Drop old indexes and recreate with partialFilterExpression
 * Run: node migrations/fix-like-indexes.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function fixLikeIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/facetok', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected successfully');

    const db = mongoose.connection.db;
    const likesCollection = db.collection('likes');

    // Get existing indexes
    console.log('\n=== Current Indexes ===');
    const indexes = await likesCollection.indexes();
    indexes.forEach(idx => console.log(JSON.stringify(idx, null, 2)));

    // Drop problematic indexes
    console.log('\n=== Dropping old indexes ===');
    try {
      await likesCollection.dropIndex('commentId_1_userId_1');
      console.log('✓ Dropped commentId_1_userId_1');
    } catch (e) {
      console.log('⚠ commentId_1_userId_1 not found:', e.message);
    }

    try {
      await likesCollection.dropIndex('postId_1_userId_1');
      console.log('✓ Dropped postId_1_userId_1');
    } catch (e) {
      console.log('⚠ postId_1_userId_1 not found:', e.message);
    }

    // Create new indexes with partialFilterExpression
    console.log('\n=== Creating new indexes ===');
    
    await likesCollection.createIndex(
      { postId: 1, userId: 1 },
      { 
        unique: true,
        partialFilterExpression: { postId: { $type: 'objectId' } },
        name: 'postId_1_userId_1'
      }
    );
    console.log('✓ Created postId_1_userId_1 with partialFilterExpression');

    await likesCollection.createIndex(
      { commentId: 1, userId: 1 },
      { 
        unique: true,
        partialFilterExpression: { commentId: { $type: 'objectId' } },
        name: 'commentId_1_userId_1'
      }
    );
    console.log('✓ Created commentId_1_userId_1 with partialFilterExpression');

    // Verify new indexes
    console.log('\n=== New Indexes ===');
    const newIndexes = await likesCollection.indexes();
    newIndexes.forEach(idx => console.log(JSON.stringify(idx, null, 2)));

    // Clean up duplicate records (keep only the first occurrence)
    console.log('\n=== Cleaning up duplicates ===');
    const duplicates = await likesCollection.aggregate([
      { $match: { commentId: null } },
      { $group: { _id: { userId: '$userId', postId: '$postId' }, count: { $sum: 1 }, ids: { $push: '$_id' } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} duplicate groups`);
      for (const dup of duplicates) {
        // Keep the first, delete the rest
        const idsToDelete = dup.ids.slice(1);
        await likesCollection.deleteMany({ _id: { $in: idsToDelete } });
        console.log(`✓ Removed ${idsToDelete.length} duplicates for userId ${dup._id.userId}`);
      }
    } else {
      console.log('No duplicates found');
    }

    console.log('\n✅ Migration completed successfully');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

fixLikeIndexes();
