const { pool } = require("../../shared/config/db/postgres");

const paymentRepository = {
    async createPayment({ payment_id, amount, user_id, provider_transaction_id }){
      try{
        const query = ` INSERT INTO payments ( payment_id, amount, user_id, provider_transaction_id ) VALUES ( $1, $2, $3, $4 )
          RETURNING id, payment_id, user_id, amount, currency, status, provider_transaction_id, retry_count, created_at;`;
      
        const values = [ payment_id, amount, user_id, provider_transaction_id ];
        const result = await pool.query(query, values);
        return result.rows[0];
      }
      catch(error){
        logger.error('Error in [paymentRepository][createPayment]', {error: error.message});
        throw error;
      }
    },

    async getPaymentById(paymentId){
      try{
        const query = `SELECT provider_transaction_id, user_id, amount, status FROM payments WHERE provider_transaction_id = $1 LIMIT 1;`;
        const values = [paymentId];
        const result = await pool.query(query, values);
        return result.rows[0];
      }
      catch(error){
        logger.error('Error in [paymentRepository][getPaymentById]', { error: error.message });
        throw error;
      }
    },

    async updatePayment(data){
      try{
        const { paymentId, status, providerTransactionId, failureReason, retryCount } = data;
        let query, values;
        const updatedAt = new Date();
        if(failureReason){
          query = `UPDATE payments SET status = $1, failure_reason = $2, retry_count = $3, updated_at = $4 WHERE payment_id = $5`;
          values = [status, failureReason, retryCount, updatedAt, paymentId];
        }
        else if(providerTransactionId){
          query = `UPDATE payments SET status = $1, provider_transaction_id = $2, updated_at = $3 WHERE payment_id = $4`;
          values = [status, providerTransactionId, updatedAt, paymentId];
        }
        else{
          query = `UPDATE payments SET status = $1, updated_at = $2 WHERE payment_id = $3`;
          values = [status, updatedAt, paymentId];
        }
        await pool.query(query, values);
      }
      catch(error){
        logger.error('Error in [paymentRepository][updatePayment]', {error: error.message});
        throw error;
      }
    }
}


module.exports = paymentRepository;