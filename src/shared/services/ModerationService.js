'use strict';
//----------------------------------------------------------------
const OpenAI = require('openai');
const logger = require('../utils/logger');

/**
 * Content Moderation Service using OpenAI
 * Kiểm duyệt nội dung text, image để phát hiện:
 * - Hate speech (ngôn từ thù địch)
 * - Violence (bạo lực)
 * - Sexual content (nội dung khiêu dâm)
 * - Self-harm (tự gây thương tích)
 * - Harassment (quấy rối)
 */
class ModerationService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      logger.warn('OpenAI API key not configured. Content moderation will be disabled.');
      this.enabled = false;
      return;
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
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
      const response = await this.openai.moderations.create({
        input: text,
      });

      const result = response.results[0];
      
      // Kiểm tra các category có vượt ngưỡng không
      const violations = [];
      for (const [category, score] of Object.entries(result.category_scores)) {
        const threshold = this.thresholds[category] || 0.8;
        if (score >= threshold) {
          violations.push({
            category,
            score: score.toFixed(3),
            threshold,
          });
        }
      }

      const flagged = violations.length > 0;
      const reason = flagged 
        ? `Vi phạm nội dung: ${violations.map(v => `${v.category} (${v.score})`).join(', ')}`
        : null;

      logger.info('Text moderation result:', {
        textLength: text.length,
        flagged,
        violations: violations.length,
      });

      return {
        flagged,
        categories: result.categories,
        scores: result.category_scores,
        violations,
        reason,
      };
    } catch (error) {
      logger.error('Text moderation error:', {
        error: error.message,
        stack: error.stack,
      });
      // Trong trường hợp lỗi, cho phép nội dung đi qua nhưng log warning
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
   * Sử dụng GPT-4 Vision để phân tích nội dung hình ảnh
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
      // Sử dụng GPT-4 Vision để phân tích ảnh
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Model rẻ hơn cho moderation
        messages: [
          {
            role: 'system',
            content: `You are a content moderation AI. Analyze this image for:
- Hate symbols or hate speech
- Violence or graphic content
- Sexual or pornographic content
- Self-harm imagery
- Harassment or bullying
- Illegal activities
- Minor safety concerns

Respond in JSON format:
{
  "flagged": boolean,
  "categories": ["category1", "category2"],
  "severity": "low|medium|high",
  "reason": "brief explanation in Vietnamese"
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 300,
        temperature: 0.2, // Thấp để kết quả nhất quán
      });

      const content = response.choices[0]?.message?.content;
      let analysis;
      
      try {
        // Parse JSON response
        analysis = JSON.parse(content);
      } catch (parseError) {
        // Nếu không parse được, extract thông tin cơ bản
        analysis = {
          flagged: content.toLowerCase().includes('flagged: true'),
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
