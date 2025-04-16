// shared/helper/serviceResponse.js
const success = (data = {}, message = "Success") => ({
  success: true,
  message,
  data
});

const error = (code = "ERROR", message = "Something went wrong", detail) => ({
  success: false,
  error: { code, message, ...(detail && { detail }) }
});

module.exports = { success, error };
