"use strict";
//----------------------------------------------------------------

/**
 * Format date để hiển thị
 * @param {Date} date - Date object cần format
 * @returns {string} Ngày đã được format theo dạng YYYY-MM-DD
 */
const formatDate = (date) => {
  if (!date) return null;
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    
    return d.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
};

module.exports = formatDate; 