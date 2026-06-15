function normalizeAxiosError(err) {
    if (!err) return null;
    // Axios HTTP response error
    if (err.response) {
        return { status: err.response.status, body: err.response.data };
    }

    // Opossum fallback that resolved with { status, data }
    if (typeof err === 'object' && err.status && (err.data || err.body)) {
        return { status: err.status, body: err.data || err.body };
    }

    // Generic object with status + data
    if (typeof err === 'object' && err.status && err.message) {
        return { status: err.status, body: { message: err.message } };
    }

    return null;
}

function errorHandler(err, req, res, next) {
    const normalized = normalizeAxiosError(err);
    if (normalized) {
        const status = normalized.status || 503;
        const body = normalized.body || { message: 'Service error' };
        return res.status(status).json(body);
    }

    // Fallback for unknown errors
    return res.status(500).json({ error: 'Internal Server Error' });
}

module.exports = errorHandler;
