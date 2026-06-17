# Architecture

## System Overview

The Distributed Payment Orchestrator is built using a microservices architecture with three core components:

* **API Gateway** – Handles authentication, rate limiting, and request routing.
* **Payment Service** – Contains payment business logic and database interactions.
* **Payment Worker** – Processes payments asynchronously using BullMQ.

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

## Key Design Patterns

### Circuit Breaker

Prevents cascading failures when downstream services become unavailable.

* Request timeout: 5s
* Error threshold: 50%
* Reset timeout: 30s

### Rate Limiting

Redis-backed rate limiting to protect APIs.

* Token generation: 5 req/min
* Create payment: 10 req/min
* Payment status lookup: 100 req/min

### Asynchronous Processing

Payments are accepted immediately and processed in the background.

* BullMQ queue
* 3 retry attempts with exponential backoff
* Worker concurrency: 2

### Idempotency

Unique `payment_id` ensures duplicate requests do not result in duplicate charges.

### Dead Letter Queue

Jobs that fail after exhausting retries are moved to a DLQ for manual inspection.

---

## Payment Flow

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
Payment Worker
  ↓
Payment Provider
  ↓
Update Status (SUCCESS / FAILED)
```

---

## Database Schema

| Column                  | Description                |
| ----------------------- | -------------------------- |
| payment_id              | Unique payment identifier  |
| provider_transaction_id | External transaction ID    |
| user_id                 | User reference             |
| amount                  | Payment amount             |
| status                  | PENDING / SUCCESS / FAILED |
| retry_count             | Number of retries          |
| created_at              | Creation timestamp         |

Indexes are maintained on `payment_id`, `user_id`, and `status` for efficient lookups.

---

## Scalability & Monitoring

* Stateless services support horizontal scaling.
* Multiple worker instances can process jobs concurrently.
* PostgreSQL connection pooling improves database performance.
* Redis is used for queue management and rate limiting.
* Structured logging with Winston and health check endpoints provide observability.

---

## Tech Stack

* **Node.js**
* **Express.js**
* **PostgreSQL**
* **Redis**
* **BullMQ**
* **JWT Authentication**
* **Winston Logging**
* **Circuit Breaker Pattern**
