const crypto = require('crypto');

const generatePaymentId = () => {
  return crypto.randomUUID();
};

module.exports = {
  generatePaymentId,
};