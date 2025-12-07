"use strict";
//----------------------------------------------------------------
const AnnouncementModel = require("../models/AnnouncementModel");

class AnnouncementRepository {
  /**
   * Create a new announcement
   */
  async create(announcementData) {
    try {
      const announcement = new AnnouncementModel(announcementData);
      return await announcement.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find all announcements with filters
   */
  async findAll(filter = {}, projection = {}, options = {}) {
    try {
      return await AnnouncementModel
        .find(filter, projection, options)
        .populate('createdBy', 'fullName email profilePicture')
        .lean();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find announcement by ID
   */
  async findById(id) {
    try {
      return await AnnouncementModel
        .findById(id)
        .populate('createdBy', 'fullName email profilePicture')
        .lean();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update announcement
   */
  async update(id, updateData) {
    try {
      return await AnnouncementModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .populate('createdBy', 'fullName email profilePicture')
        .lean();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete announcement
   */
  async delete(id) {
    try {
      return await AnnouncementModel.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Count announcements
   */
  async countDocuments(filter = {}) {
    try {
      return await AnnouncementModel.countDocuments(filter);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get active announcements for a user based on role
   */
  async getActiveForUser(userRole) {
    try {
      const now = new Date();
      const filter = {
        isActive: true,
        $and: [
          {
            $or: [
              { startsAt: null },
              { startsAt: { $lte: now } }
            ]
          },
          {
            $or: [
              { expiresAt: null },
              { expiresAt: { $gt: now } }
            ]
          },
          {
            $or: [
              { targetAudience: 'all' },
              { targetAudience: userRole }
            ]
          }
        ]
      };

      return await AnnouncementModel
        .find(filter)
        .populate('createdBy', 'fullName email profilePicture')
        .sort({ createdAt: -1 })
        .lean();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AnnouncementRepository;
