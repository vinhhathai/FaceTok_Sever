const response = require('./controllerResponse');

const handleServiceResult = (res, result, statusMap = {}, successStatus = 200) => {
  if (result.success) {
    return res.status(successStatus).json({
      success: true,
      message: result.message,
      data: result.data,
      timestamp: new Date().toISOString()
    });
  } else {
    const statusCode = statusMap[result.error.code] || 400;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: result.error.code,
        message: result.error.message,
        ...(result.error.detail && { detail: result.error.detail })
      },
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = { handleServiceResult }; 