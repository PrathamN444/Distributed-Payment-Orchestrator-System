# API Reference

## Base URL

```bash
http://localhost:3000/api/v1
```

---

## Authentication

Generate a JWT token before accessing protected endpoints.

### Generate Token

```http
POST /generate-jwt-token
```

**Headers**

```text
userid: user123
```

**Response**

```json
{
  "success": true,
  "token": "<jwt_token>",
  "expiresIn": "1h"
}
```

---

## Payment APIs

### Create Payment

```http
POST /payments
```

**Headers**

```text
Authorization: Bearer <token>
userid: user123
Content-Type: application/json
```

**Body**

```json
{
  "TransactionId": "txn-001",
  "Amount": 99.99,
  "UserId": "user123"
}
```

**Response**

```json
{
  "Payment": {
    "payment_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "PENDING"
  },
  "DuplicatePayment": false
}
```

---

### Get Payment Status

```http
GET /payments/:id
```

**Headers**

```text
Authorization: Bearer <token>
userid: user123
```

**Response**

```json
{
  "Data": {
    "Status": "SUCCESS",
    "Amount": 99.99,
    "TransactionId": "txn-001"
  }
}
```

---

## Error Responses

| Status Code | Description                       |
| ----------- | --------------------------------- |
| 400         | Invalid request or missing fields |
| 401         | Invalid or expired token          |
| 403         | User ID mismatch                  |
| 404         | Payment not found                 |
| 429         | Rate limit exceeded               |
| 500         | Internal server error             |

---

## Rate Limits

| Endpoint                   | Limit       |
| -------------------------- | ----------- |
| `POST /generate-jwt-token` | 5 req/min   |
| `POST /payments`           | 10 req/min  |
| `GET /payments/:id`        | 100 req/min |

---

## Example Usage

### Generate Token

```bash
curl -X POST http://localhost:3000/api/v1/generate-jwt-token \
-H "userid: user123"
```

### Create Payment

```bash
curl -X POST http://localhost:3000/api/v1/payments \
-H "Authorization: Bearer <token>" \
-H "userid: user123" \
-H "Content-Type: application/json" \
-d '{
  "TransactionId":"txn-001",
  "Amount":99.99,
  "UserId":"user123"
}'
```

### Get Payment Status

```bash
curl -X GET http://localhost:3000/api/v1/payments/txn-001 \
-H "Authorization: Bearer <token>" \
-H "userid: user123"
```

---

## Health Checks

### API Gateway

```http
GET /health
```

### Payment Service

```http
GET http://localhost:4000/health
```

---

## Key Features

* JWT-based authentication
* Redis-backed rate limiting
* Idempotent payment processing
* Asynchronous job processing with BullMQ
* Retry mechanism with exponential backoff
* Dead Letter Queue for failed jobs
* Health check endpoints
