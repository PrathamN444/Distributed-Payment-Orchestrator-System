const { paymentServiceBreaker } = require('../utils/gatewayCircuitBreaker');

function buildPaymentServiceRequest({ method, path, data, jwtToken, params }) {
  const requestOptions = {
    method,
    url: `${process.env.PAYMENT_SERVICE_URL}${path}`,
    headers: {
      'jwt-token': jwtToken,
      accept: 'application/json',
      'content-type': 'application/json',
    },
  };

  if (data !== undefined) {
    requestOptions.data = data;
  }

  if (params !== undefined) {
    requestOptions.params = params;
  }

  return requestOptions;
}

async function callPaymentService({ method, path, data, jwtToken, params }) {
  const requestOptions = buildPaymentServiceRequest({ method, path, data, jwtToken, params });
  return paymentServiceBreaker.fire(requestOptions);
}

module.exports = { callPaymentService };