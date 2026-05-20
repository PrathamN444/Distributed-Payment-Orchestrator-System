const { logger } = require("../../shared/middleware/logger");
const responseHandler = require("../../shared/utils/responseHandler");
const { StatusCodes } = require('http-status-codes');
const paymentRepository = require("../repositories/paymentRepository");
const { generatePaymentId } = require("../utils/commonMethods");

const createPayment = async (requestModel) => {
    const { TransactionId, Amount, UserId } = requestModel;
    try{
        if(!TransactionId || !Amount || !UserId){
            return responseHandler.failResponse('Missing required fields: TransactionId, Amount, UserId', StatusCodes.BAD_REQUEST);
        }
        
        const payment = {
            provider_transaction_id: TransactionId,
            user_id: UserId,
            amount: Amount,
            payment_id: generatePaymentId(),
        };
        const createdPayment = await paymentRepository.createPayment(payment); 
        return responseHandler.successResponse({ Payment: createdPayment, DuplicatePayment: false }, 'Payment created successfully', StatusCodes.ACCEPTED);
    }
    catch(error){
        if(error.code === '23505'){
            const existingPayment = await paymentRepository.getPaymentById(TransactionId);
            return responseHandler.successResponse({ Payment: existingPayment, DuplicatePayment: true }, 'Payment with this TransactionId already exists', StatusCodes.ACCEPTED);
        }

        logger.error('Error in createPaymentService', {
            error: error && error.message,
            stack: error && error.stack,
        });
        return responseHandler.failResponse('Internal server error in createPaymentService', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

const getPaymentStatusById = async (id) => {
    try{
        if(!id || isNaN(id) || id <= 0){
            return responseHandler.failResponse('Invalid payment ID', StatusCodes.BAD_REQUEST);
        }

        const paymentDetails = await paymentRepository.getPaymentById(id);
        
        if(!paymentDetails){
            return responseHandler.failResponse('Payment not found', StatusCodes.NOT_FOUND);
        }

        const paymentData = {
            Status: paymentDetails.status,
            Amount: paymentDetails.amount,
            TransactionId: paymentDetails.provider_transaction_id,
            UserId: paymentDetails.user_id,
        }

        return responseHandler.successResponse({ Data : paymentData }, 'Payment status retrieved successfully', StatusCodes.OK);
    }
    catch(error){
        logger.error('Error in getPaymentStatusByIdService', {
            error: error && error.message,
            stack: error && error.stack,
        });
        return responseHandler.failResponse('Internal server error in getPaymentStatusByIdService', StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

module.exports = {
    createPayment,
    getPaymentStatusById,
}