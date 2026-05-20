const { logger } = require("../../shared/middleware/logger");
const responseHandler = require("../../shared/utils/responseHandler");
const { createPayment, getPaymentStatusById } = require("../services/paymentService");
const { StatusCodes } = require('http-status-codes');

const createPaymentController = async (req, res) => {
    try{
        logger.info(`Received create payment request: ${JSON.stringify(req.body)}`);
        const result = await createPayment(req.body);
        return res.status(result.statusCode).json(result.result);
    }
    catch(error){
        logger.error('Error in createPaymentController', {
            error: error && error.message,
            stack: error && error.stack,
        });
        return responseHandler.failResponse('Internal server error in createPaymentService', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

const getPaymentStatusController = async (req, res) => {
    try{
        logger.info(`Received get payment status request for ID: ${req.query.id}`);
        const result = await getPaymentStatusById(req.query.id);
        return res.status(result.statusCode).json(result.result);
    }
    catch(error){
        logger.error('Error in getPaymentStatusController', {
            error: error && error.message,
            stack: error && error.stack,
        });
        return responseHandler.failResponse('Internal server error in getPaymentStatusController', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    createPaymentController,
    getPaymentStatusController,
}