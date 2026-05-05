# WAAS Project

## What is being built

A Webhook-as-a-Service (WAAS) platform that receives HTTP events, stores them, and reliably forwards them to user-defined endpoints.

---

## ⚙️ Core Idea (Mental Model)

Event Source → WAAS → Subscriber Endpoint(s)

The system sits in the middle and ensures reliable delivery.

---

## Functional Requirements

## 1. Event Ingestion API

An endpoint like the following is exposed:

POST /events

This endpoint:

- accepts HTTP events from any producer
- validates the request format
- extracts event type and payload
- stores the event in the database
- returns a fast response without waiting for delivery

---

## 2. Event Storage (PostgreSQL)

Every event is persisted in PostgreSQL.

This is done to:

- prevent data loss
- enable retries
- track delivery status

Each stored record includes:

- event_id
- event_type
- payload
- timestamp
- status (pending, processing, failed, delivered)

---

## 3. Subscriber Management

Endpoints are registered by users through:

POST /subscriptions

Each subscription includes:

- event type to subscribe to
- destination URL

Example:
{
"event": "user.created",
"url": "[https://client-app.com/webhook](https://client-app.com/webhook)"
}

---

## 4. Event Fan-out System

When an event is received:

- all subscribers for that event type are identified
- delivery tasks are created for each subscriber
- each subscriber is served independently

---

## 5. Delivery Engine (Webhook Sender)

Worker processes are responsible for delivery:

- HTTP POST requests are sent to subscriber URLs
- event data is included in the request body
- timeouts and failures are handled

Example request:
POST [https://client-app.com/webhook](https://client-app.com/webhook)
Content-Type: application/json

{
"event": "user.created",
"data": { ... }
}

---

## 6. Retry System (Reliability Layer)

When delivery fails:

- automatic retries are triggered
- exponential backoff is applied (1s → 5s → 30s …)
- retry state is stored in the database

Common failure cases:

- timeouts
- server errors
- network failures

---

## 7. Delivery Tracking

The following are tracked:

- successful deliveries
- failed deliveries
- retry attempts
- timestamps

This enables debugging such as:
“Whether a webhook reached its destination or not”

---

## 8. Async Processing

Event ingestion is not blocked by delivery.

Flow:
Event is received → stored in DB → 200 OK is returned → background workers handle delivery

---
