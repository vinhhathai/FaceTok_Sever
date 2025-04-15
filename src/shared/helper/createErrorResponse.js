// Helper function to create standardized error responses
const createErrorResponse = (statusCode, code, message, systemMessage) => {
  return {
    success: false,
    statusCode,
    error: {
      code,
      message,
      systemMessage,
    },
  };
};
module.exports = { createErrorResponse };
