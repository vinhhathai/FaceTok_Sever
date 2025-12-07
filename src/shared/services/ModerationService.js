'use strict';
//----------------------------------------------------------------
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

/**
 * Content Moderation Service using Google Gemini
 * Kiểm duyệt nội dung text, image để phát hiện:
 * - Hate speech (ngôn từ thù địch)
 * - Violence (bạo lực)
 * - Sexual content (nội dung khiêu dâm)
 * - Self-harm (tự gây thương tích)
 * - Harassment (quấy rối)
 */
class ModerationService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      logger.warn('Gemini API key not configured. Content moderation will be disabled.');
      this.enabled = false;
      return;
    }

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    this.enabled = true;

    // Ngưỡng vi phạm (0-1, càng thấp càng nghiêm)
    this.thresholds = {
      hate: 0.7,           // Ngôn từ thù địch
      'hate/threatening': 0.8, // Đe dọa với thù địch
      'self-harm': 0.8,    // Tự gây thương tích
      sexual: 0.7,         // Nội dung khiêu dâm
      'sexual/minors': 0.5, // Nội dung liên quan trẻ em (NGHIÊM)
      violence: 0.8,       // Bạo lực
      'violence/graphic': 0.8, // Bạo lực đồ họa
      harassment: 0.7,     // Quấy rối
      'harassment/threatening': 0.8, // Đe dọa quấy rối
    };
  }

  /**
   * Kiểm duyệt nội dung text
   * @param {string} text - Nội dung cần kiểm tra
   * @returns {Promise<Object>} { flagged, categories, scores, reason }
   */
  async moderateText(text) {
    if (!this.enabled) {
      return { flagged: false, categories: {}, scores: {}, reason: null };
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return { flagged: false, categories: {}, scores: {}, reason: null };
    }

    try {
      const prompt = `Analyze this text for content moderation. Check for:
- Hate speech (ngôn từ thù địch)
- Violence (bạo lực)
- Sexual content (nội dung khiêu dâm)
- Self-harm (tự gây thương tích)
- Harassment (quấy rối)
- Threatening language

Text to analyze: "${text}"

Respond ONLY in JSON format:
{
  "flagged": boolean,
  "categories": {
    "hate": boolean,
    "violence": boolean,
    "sexual": boolean,
    "self-harm": boolean,
    "harassment": boolean
  },
  "violations": [{"category": "string", "severity": "low|medium|high"}],
  "reason": "brief explanation in Vietnamese or null if safe"
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      // Parse JSON response
      let analysis;
      try {
        // Remove markdown code blocks if present
        const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        analysis = JSON.parse(jsonText);
      } catch (parseError) {
        logger.warn('Failed to parse Gemini response, treating as safe', { responseText });
        return { flagged: false, categories: {}, scores: {}, reason: null };
      }

      const violations = analysis.violations || [];
      const flagged = analysis.flagged || false;
      const reason = flagged ? analysis.reason : null;

      logger.info('Text moderation result:', {
        textLength: text.length,
        flagged,
        violations: violations.length,
      });

      return {
        flagged,
        categories: analysis.categories || {},
        scores: {},
        violations,
        reason,
      };
    } catch (error) {
      logger.error('Text moderation error:', {
        error: error.message,
        stack: error.stack,
      });
      
      // Handle rate limit or quota exceeded
      if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('rate limit')) {
        logger.warn('Gemini rate limit exceeded - allowing content through');
        return { 
          flagged: false, 
          categories: {}, 
          scores: {}, 
          reason: null,
          skipped: true,
          skipReason: 'Rate limit exceeded'
        };
      }
      
      // Trong trường hợp lỗi khác, cho phép nội dung đi qua nhưng log warning
      return { 
        flagged: false, 
        categories: {}, 
        scores: {}, 
        reason: null,
        error: error.message,
      };
    }
  }

  /**
   * Kiểm duyệt hình ảnh qua URL
   * Sử dụng Gemini Vision để phân tích nội dung hình ảnh
   * @param {string} imageUrl - URL của hình ảnh
   * @returns {Promise<Object>} { flagged, reason, analysis }
   */
  async moderateImage(imageUrl) {
    if (!this.enabled) {
      return { flagged: false, reason: null, analysis: null };
    }

    if (!imageUrl) {
      return { flagged: false, reason: null, analysis: null };
    }

    try {
      // Fetch image as base64
      const https = require('https');
      const http = require('http');
      const imageData = await new Promise((resolve, reject) => {
        const protocol = imageUrl.startsWith('https') ? https : http;
        protocol.get(imageUrl, (res) => {
          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', reject);
        });
      });

      const base64Image = imageData.toString('base64');
      const mimeType = imageUrl.includes('.png') ? 'image/png' : 'image/jpeg';

      const prompt = `You are a content moderation AI. Analyze this image for:
- Hate symbols or hate speech
- Violence or graphic content
- Sexual or pornographic content
- Self-harm imagery
- Harassment or bullying
- Illegal activities
- Minor safety concerns

Respond ONLY in JSON format:
{
  "flagged": boolean,
  "categories": ["category1", "category2"],
  "severity": "low|medium|high",
  "reason": "brief explanation in Vietnamese"
}`;

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
      ]);

      const response = await result.response;
      const content = response.text();
      let analysis;
      
      try {
        // Remove markdown code blocks if present
        const jsonText = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        analysis = JSON.parse(jsonText);
      } catch (parseError) {
        // Nếu không parse được, extract thông tin cơ bản
        analysis = {
          flagged: content.toLowerCase().includes('flagged: true') || content.toLowerCase().includes('"flagged": true'),
          categories: [],
          severity: 'low',
          reason: content,
        };
      }

      logger.info('Image moderation result:', {
        imageUrl: imageUrl.substring(0, 100),
        flagged: analysis.flagged,
        categories: analysis.categories,
      });

      return {
        flagged: analysis.flagged || false,
        reason: analysis.flagged ? analysis.reason : null,
        analysis,
      };
    } catch (error) {
      logger.error('Image moderation error:', {
        error: error.message,
        imageUrl: imageUrl.substring(0, 100),
      });
      // Trong trường hợp lỗi, cho phép ảnh đi qua nhưng log warning
      return { 
        flagged: false, 
        reason: null, 
        analysis: null,
        error: error.message,
      };
    }
  }

  /**
   * Kiểm duyệt toàn bộ post (text + images)
   * @param {Object} postData - { content, mediaUrls }
   * @returns {Promise<Object>} { approved, violations, textResult, imageResults }
   */
  async moderatePost(postData) {
    const { content, mediaUrls = [] } = postData;
    const violations = [];
    let textResult = null;
    const imageResults = [];

    // 1. Kiểm tra text content
    if (content && content.trim().length > 0) {
      textResult = await this.moderateText(content);
      if (textResult.flagged) {
        violations.push({
          type: 'text',
          reason: textResult.reason,
          violations: textResult.violations,
        });
      }
    }

    // 2. Kiểm tra từng image (giới hạn 5 ảnh để tránh chi phí cao)
    const imagesToCheck = mediaUrls.slice(0, 5);
    for (const imageUrl of imagesToCheck) {
      const imageResult = await this.moderateImage(imageUrl);
      imageResults.push({
        url: imageUrl,
        result: imageResult,
      });
      
      if (imageResult.flagged) {
        violations.push({
          type: 'image',
          url: imageUrl,
          reason: imageResult.reason,
          analysis: imageResult.analysis,
        });
      }
    }

    const approved = violations.length === 0;

    logger.info('Post moderation completed:', {
      approved,
      violationCount: violations.length,
      hasText: !!content,
      imageCount: imagesToCheck.length,
    });

    return {
      approved,
      violations,
      textResult,
      imageResults,
      summary: approved 
        ? 'Nội dung phù hợp'
        : `Phát hiện ${violations.length} vi phạm`,
    };
  }

  /**
   * Kiểm tra xem service có được kích hoạt không
   */
  isEnabled() {
    return this.enabled;
  }
}

// Singleton instance
let instance = null;
const getModerationService = () => {
  if (!instance) {
    instance = new ModerationService();
  }
  return instance;
};

module.exports = getModerationService();
