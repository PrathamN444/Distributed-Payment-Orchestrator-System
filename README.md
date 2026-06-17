# 💳 Distributed Payment Orchestrator

A production-grade payment processing system built with Node.js and microservices. It provides reliable asynchronous payment execution with retries, rate limiting, circuit breakers, and idempotent processing.

---

## ✨ Features

* Asynchronous payment processing with BullMQ
* JWT authentication
* Redis-backed rate limiting
* Circuit breaker for fault tolerance
* Automatic retries with exponential backoff
* Dead Letter Queue (DLQ)
* Duplicate payment protection
* Structured logging with Winston
* Health check endpoints

---

## 🏗️ Architecture

```text
Client
  │
  ▼
API Gateway
  │
  ▼
Payment Service
  ├── PostgreSQL
  ├── Redis + BullMQ
  ▼
Payment Worker
  ▼
External Payment Provider
```

---

## 🛠 Tech Stack

* Node.js
* Express.js
* PostgreSQL
* Redis
* BullMQ
* JWT
* Opossum (Circuit Breaker)
* Winston

---

## 🚀 Quick Start

```bash
# Clone repository
git clone <repository-url>
cd distributed-payment-orchestrator-system

# Install dependencies
npm install

# Start PostgreSQL and Redis
docker-compose up -d

# Start services
npm run api-gateway
npm run payment-service
npm run start-worker
```

Verify:

```bash
curl http://localhost:3000/health
curl http://localhost:4000/health
```

---

## 📁 Project Structure

```text
payment-orchestrator/
├── api-gateway/
├── payment-service/
├── shared/
├── logs/
├── docker-compose.yml
└── package.json
```

---

## 🔄 Payment Flow

```text
Client
  ↓
API Gateway
  ↓
Payment Service
  ↓
PostgreSQL (PENDING)
  ↓
BullMQ Queue
  ↓
Worker
  ↓
Payment Provider
  ↓
SUCCESS / FAILED
```

---

## 📚 Documentation

Detailed documentation is available in separate files:

| File              | Description                 |
| ----------------- | --------------------------- |
| `QUICK_START.md`  | Setup and local development |
| `ARCHITECTURE.md` | System design and patterns  |
| `API.md`          | API reference and examples  |
| `DEPLOYMENT.md`   | Deployment instructions     |
| `SECURITY.md`     | Security considerations     |

---

## 🔑 Key Design Patterns

* **Microservices Architecture**
* **Circuit Breaker**
* **Queue-based Asynchronous Processing**
* **Idempotency**
* **Retry with Exponential Backoff**
* **Dead Letter Queue**
* **Rate Limiting**

---

## 📊 Observability

* Structured logging with Winston
* Health check endpoints
* Worker success/failure events
* Queue monitoring
* Error tracking

---

## 📝 Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Important variables:

* `JWT_SECRET_KEY`
* `POSTGRES_DB_PASSWORD`
* `REDIS_URL`
* `PAYMENT_SERVICE_URL`

---

## 🚀 Future Improvements

* Prometheus metrics
* OpenTelemetry tracing
* Webhooks
* TypeScript migration
* Kubernetes deployment

---

## 📄 License

ISC License.
