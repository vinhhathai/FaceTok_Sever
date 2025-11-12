"use strict";
//----------------------------------------------------------------
const ReportModel = require("../models/ReportModel");

/**
 * Repository xử lý dữ liệu report
 */
class ReportRepository {
  constructor() {
    this.model = ReportModel;
  }

  /**
   * Tạo report mới
   * @param {Object} reportData - Dữ liệu report
   * @returns {Promise<Object>} Report đã tạo
   */
  async create(reportData) {
    const report = new this.model(reportData);
    return report.save();
  }

  /**
   * Tìm report theo ID
   * @param {string} id - Report ID
   * @returns {Promise<Object>} Report
   */
  async findById(id) {
    return this.model.findById(id)
      .populate('reportedBy', 'fullName email profilePicture')
      .populate('resolvedBy', 'fullName email');
  }

  /**
   * Tìm tất cả reports với filter và pagination
   * @param {Object} filter - Filter conditions
   * @param {Object} projection - Fields to return
   * @param {Object} options - Options (skip, limit, sort)
   * @returns {Promise<Array>} Danh sách reports
   */
  async findAll(filter = {}, projection = {}, options = {}) {
    const query = this.model.find(filter, projection, options)
      .populate('reportedBy', 'fullName email profilePicture')
      .populate('resolvedBy', 'fullName email');
    
    if (options.sort) query.sort(options.sort);
    if (options.skip) query.skip(options.skip);
    if (options.limit) query.limit(options.limit);
    
    return query.exec();
  }

  /**
   * Đếm số lượng reports
   * @param {Object} filter - Filter conditions
   * @returns {Promise<number>} Số lượng reports
   */
  async countDocuments(filter = {}) {
    return this.model.countDocuments(filter);
  }

  /**
   * Update report
   * @param {string} id - Report ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated report
   */
  async update(id, updateData) {
    return this.model.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('reportedBy', 'fullName email profilePicture')
      .populate('resolvedBy', 'fullName email');
  }

  /**
   * Xóa report
   * @param {string} id - Report ID
   * @returns {Promise<Object>} Deleted report
   */
  async delete(id) {
    return this.model.findByIdAndDelete(id);
  }
}

module.exports = ReportRepository;
