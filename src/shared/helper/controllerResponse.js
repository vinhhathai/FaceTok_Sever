// shared/helper/controllerResponse.js
const send = (res, { success, message, data, error }, path, statusCode = 200) => {
  const base = {
    timestamp: new Date().toISOString(),
    path,
    code: success ? "SUCCESS" : error?.code,
  };

  return res.status(statusCode).json(
    success
      ? { ...base, message, data }
      : { ...base, error: { name: error.message, ...(error.detail && { detail: error.detail }) } }
  );
};

const handle = (res, result, path, statusMap = {}) => {
  const code = result.success ? 200 : statusMap[result.error.code] || 400;
  return send(res, result, path, code);
};

module.exports = { handle };
