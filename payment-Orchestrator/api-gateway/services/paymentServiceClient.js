const { paymentServiceBreaker } = require('../utils/gatewayCircuitBreaker');

function buildPaymentServiceRequest(method, path, data, jwtToken) {
  const requestOptions = {
    method,
    url: `${process.env.PAYMENT_SERVICE_URL}${path}`,
    headers: {
      'jwt-token': jwtToken,
      accept: 'application/json',
      'content-type': 'application/json',
    },
  };

  if(method === 'get'){
    if(data && Object.keys(data).length){
      requestOptions.params = data;
    }
  }
  else{
    requestOptions.data = data;
  }

  return requestOptions;
}

async function callPaymentService(method, path, data, jwtToken) {
  const requestOptions = buildPaymentServiceRequest(method, path, data, jwtToken);
  try{
    const response = await paymentServiceBreaker.fire(requestOptions);
    return response;
  }
  catch(error){
    throw error;
  }
}

module.exports = { callPaymentService };