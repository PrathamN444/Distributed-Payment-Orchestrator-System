const { pool } = require("../../shared/config/db/postgres");

const paymentRepository = {
    async createPayment({ payment_id, amount, user_id, provider_transaction_id }){
      const query = ` INSERT INTO payments ( payment_id, amount, user_id, provider_transaction_id ) VALUES ( $1, $2, $3, $4 )
        RETURNING id, payment_id, user_id, amount, currency, status, provider_transaction_id, retry_count, created_at;`;
    
      const values = [ payment_id, amount, user_id, provider_transaction_id ];
    
      const result = await pool.query(query, values);
    
      return result.rows[0];
    },

    async getPaymentById(paymentId){
      const query = `SELECT provider_transaction_id, user_id, amount, status FROM payments
                    WHERE provider_transaction_id = $1
                    LIMIT 1;`;
    
      const values = [paymentId];
      const result = await pool.query(query, values);
      return result.rows[0];
    }
}


module.exports = paymentRepository;