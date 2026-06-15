const API_METHODS = {
    CreatePaymentLimiterConfig: "createPaymentLimiterConfig",
    GetPaymentLimiterConfig: "getPaymentLimiterConfig",
    GenerateJwtTokenLimiterConfig: "generateJwtTokenLimiterConfig"
};

const KEY_PREFIXES = {
    CreatePaymentLimiterPrefix: "rl_create_payment",
    GetPaymentLimiterPrefix: "rl_get_payment",
    GenerateJwtTokenLimiterPrefix: "rl_generate_jwt_token"
}

const RATE_LIMITER_CONFIG = {
    [API_METHODS.CreatePaymentLimiterConfig]: {
        points: 10,
        duration: 60,
        blockDuration: 60,
        keyPrefix: KEY_PREFIXES.CreatePaymentLimiterPrefix,
    },
    
    [API_METHODS.GetPaymentLimiterConfig]: {
        points: 100,
        duration: 60,
        blockDuration: 60,
        keyPrefix: KEY_PREFIXES.GetPaymentLimiterPrefix,
    },

    [API_METHODS.GenerateJwtTokenLimiterConfig]: {
        points: 5,
        duration: 60,
        blockDuration: 60,
        keyPrefix: KEY_PREFIXES.GenerateJwtTokenLimiterPrefix,
    }
}


module.exports = {
    API_METHODS,
    KEY_PREFIXES,
    RATE_LIMITER_CONFIG
};