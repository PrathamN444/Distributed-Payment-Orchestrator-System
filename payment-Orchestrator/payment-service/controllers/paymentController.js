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
        const result = responseHandler.failResponse('Internal server error in createPaymentService', StatusCodes.INTERNAL_SERVER_ERROR);
        return res.status(result.statusCode).json(result.result);
    }
}

const getPaymentStatusController = async (req, res) => {
    try{
        const paymentId = req.params.id;
        if(!paymentId){
            logger.error('Error in getPaymentStatusController: Payment ID is missing in request parameters');
            const result = responseHandler.failResponse('Payment ID is required in request parameters', StatusCodes.BAD_REQUEST);
            return res.status(result.statusCode).json(result.result);
        }
        
        logger.info(`Received get payment status request for ID: ${paymentId}`);
        const result = await getPaymentStatusById(paymentId);
        return res.status(result.statusCode).json(result.result);
    }
    catch(error){
        logger.error('Error in getPaymentStatusController', {
            error: error && error.message,
            stack: error && error.stack,
        });
        const result = responseHandler.failResponse('Internal server error in getPaymentStatusController', StatusCodes.INTERNAL_SERVER_ERROR);
        return res.status(result.statusCode).json(result.result);
    }
}

module.exports = {
    createPaymentController,
    getPaymentStatusController,
}