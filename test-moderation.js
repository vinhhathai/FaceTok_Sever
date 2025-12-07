/**
 * Test script for Content Moderation Service
 * 
 * Usage:
 *   node test-moderation.js
 * 
 * Make sure OPENAI_API_KEY is set in .env
 */

require('dotenv').config();
const moderationService = require('./src/shared/services/ModerationService');

console.log('🧪 Testing Content Moderation Service\n');
console.log('Enabled:', moderationService.isEnabled());
console.log('');

async function testTextModeration() {
  console.log('=== TEST 1: Text Moderation ===\n');
  
  const tests = [
    {
      name: 'Normal content',
      text: 'Hello! This is a nice day. I love programming!',
      shouldPass: true
    },
    {
      name: 'Violent content',
      text: 'I want to hurt people and cause violence',
      shouldPass: false
    },
    {
      name: 'Empty string',
      text: '',
      shouldPass: true
    }
  ];

  for (const test of tests) {
    console.log(`Testing: ${test.name}`);
    console.log(`Text: "${test.text.substring(0, 50)}..."`);
    
    const result = await moderationService.moderateText(test.text);
    
    console.log(`Result: ${result.flagged ? '❌ FLAGGED' : '✅ APPROVED'}`);
    if (result.flagged) {
      console.log(`Reason: ${result.reason}`);
    }
    console.log(`Expected: ${test.shouldPass ? 'PASS' : 'FAIL'}`);
    console.log('---\n');
  }
}

async function testImageModeration() {
  console.log('=== TEST 2: Image Moderation ===\n');
  
  // Using sample public images
  const tests = [
    {
      name: 'Nature photo',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
      shouldPass: true
    }
  ];

  for (const test of tests) {
    console.log(`Testing: ${test.name}`);
    console.log(`URL: ${test.url}`);
    
    const result = await moderationService.moderateImage(test.url);
    
    console.log(`Result: ${result.flagged ? '❌ FLAGGED' : '✅ APPROVED'}`);
    if (result.flagged) {
      console.log(`Reason: ${result.reason}`);
    }
    console.log(`Expected: ${test.shouldPass ? 'PASS' : 'FAIL'}`);
    console.log('---\n');
  }
}

async function testPostModeration() {
  console.log('=== TEST 3: Complete Post Moderation ===\n');
  
  const post = {
    content: 'Check out this beautiful sunset!',
    mediaUrls: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4'
    ]
  };

  console.log('Post content:', post.content);
  console.log('Images:', post.mediaUrls.length);
  
  const result = await moderationService.moderatePost(post);
  
  console.log(`\nResult: ${result.approved ? '✅ APPROVED' : '❌ REJECTED'}`);
  console.log('Summary:', result.summary);
  if (!result.approved) {
    console.log('Violations:', result.violations);
  }
  console.log('---\n');
}

async function runTests() {
  if (!moderationService.isEnabled()) {
    console.log('⚠️  Moderation service is disabled');
    console.log('Please set OPENAI_API_KEY in .env file\n');
    process.exit(1);
  }

  try {
    await testTextModeration();
    await testImageModeration();
    await testPostModeration();
    
    console.log('✅ All tests completed!\n');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
