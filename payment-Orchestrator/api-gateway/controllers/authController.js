const { StatusCodes } = require("http-status-codes");
const { logger } = require("../../shared/middleware/logger");
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateJwtTokenController = async (req, res) => {
    try{
        const userId = req.headers.userid;
        if(!userId){
            logger.error('Error in generateJwtTokenController: User ID is missing in headers');
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'User ID is required in headers' });
        }

        const JWT_SECRET = process.env.JWT_SECRET_KEY;
        if(!JWT_SECRET){
            logger.error('Error in generateJwtTokenController: JWT secret key is not configured');
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'JWT secret key is not configured' });
        }

        const jti = crypto.randomUUID();
        const payload = { userId, jti };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        res.status(StatusCodes.OK).json({ success: true, token, expiresIn: '1h' });
    }
    catch(error){
        logger.error(`Error in generating JWT token: ${error.message}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
}

module.exports = { generateJwtTokenController };