const { StatusCodes } = require('http-status-codes');

class ResponseHandler extends Error {
    failResponse(message, statusCode = StatusCodes.BAD_REQUEST){
      const status = {
        Status: {
          Status: false,
          Message: message,
        }
      };
      
      return { statusCode, result: status };
    }

    successResponse(obj, message = "Success", statusCode = StatusCodes.OK){
      obj.Status = {
        Status: true,
        Message: message
      };

      return { statusCode, result: obj };
    }
}
module.exports = new ResponseHandler();