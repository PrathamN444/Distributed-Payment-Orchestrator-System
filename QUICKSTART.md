# Quick Start

Get the Distributed Payment Orchestrator running locally in a few minutes.

## Prerequisites

* Node.js 18+
* Docker & Docker Compose
* Git

---

## Installation

```bash
# Clone repository
git clone <repository-url>
cd distributed-payment-orchestrator-system

# Install dependencies
npm install
```

---

## Start Services

### Start Database & Redis

```bash
docker-compose up -d
```

### Start Application Services

```bash
# API Gateway
npm run api-gateway

# Payment Service
npm run payment-service

# Payment Worker
npm run start-worker
```

---

## Verify Services

```bash
curl http://localhost:3000/health
curl http://localhost:4000/health
```

Expected response:

```json
{
  "status": "OK"
}
```

---

## Create a Payment

### Generate JWT Token

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/generate-jwt-token \
-H "userid: user123" | jq -r '.token')
```

### Create Payment

```bash
curl -X POST http://localhost:3000/api/v1/payments \
-H "Authorization: Bearer $TOKEN" \
-H "userid: user123" \
-H "Content-Type: application/json" \
-d '{
  "TransactionId": "txn-001",
  "Amount": 99.99,
  "UserId": "user123"
}'
```

### Check Payment Status

```bash
curl -X GET http://localhost:3000/api/v1/payments/txn-001 \
-H "Authorization: Bearer $TOKEN" \
-H "userid: user123"
```

---

## Project Structure

```text
payment-orchestrator/
├── api-gateway/
├── payment-service/
├── shared/
└── logs/
```

---

## Configuration

Create a `.env` file:

```bash
cp .env.example .env
```

Important variables:

* `JWT_SECRET_KEY`
* `POSTGRES_DB_PASSWORD`
* `PAYMENT_SERVICE_URL`

---

## Useful Commands

```bash
# Start services
npm run api-gateway
npm run payment-service
npm run start-worker

# Stop containers
docker-compose down

# View logs
tail -f logs/combined.log

# Check database
docker exec payment-postgres psql -U admin -d payments_db

# Check Redis
docker exec payment-redis redis-cli
```

---

## Troubleshooting

### Ports already in use

```bash
lsof -i :3000
lsof -i :4000
kill -9 <PID>
```

### Restart Docker services

```bash
docker-compose restart
```

### Reset database

```bash
docker-compose down
docker-compose up -d
```

### Verify queue processing

```bash
docker exec payment-redis redis-cli
LLEN payment-processing
```

---

## Next Steps

* Explore the API documentation.
* Review the architecture overview.
* Monitor logs while payments are processed.
* Test duplicate payments and rate limiting.
