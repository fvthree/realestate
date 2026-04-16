# Real Estate Seller Platform (Philippines)

Monorepo for a **Philippines-focused real estate seller** product: a **Java Spring Boot** backend API and an agent dashboard in `frontend/` (see run instructions below). Solo agents manage listings; **buyers stay anonymous** and use **secure inquiry links** (no buyer accounts).

This README summarizes [`copilot/mvp.md`](copilot/mvp.md), which defines the product and backend design.

---

## Goals

- Secure by default  
- Simple **single-agent** model (extendable later to teams/agencies)  
- Production-ready API  
- **PH-specific** defaults (currency, timezone, address shape)

---

## Actors

| Actor | Role |
|--------|------|
| **Agent** (authenticated) | Profile and listings, publish/sold workflow, inquiry inbox, messaging with buyers |
| **Buyer** (anonymous) | Browse listings, contact agent via inquiry form, continue thread via magic-link token, update **their own** inquiry/contact details only |

---

## Core features

**Agent:** JWT login/logout, public-facing profile, property CRUD, publish and mark sold, sold history, inquiry inbox with statuses, buyer messaging.

**Buyer:** Public browse, agent profile view, inquiry without registration, secure follow-up via token.

---

## Domain model (high level)

- **Agent** — Name, email, phone; bio and service areas; optional PRC license; public avatar and social links.  
- **Property** — Agent-owned; status `DRAFT | PUBLISHED | SOLD | ARCHIVED`; price in PHP; PH address fields; type, beds, baths, area; `published_at` / `sold_at`.  
- **Inquiry** — Linked to property and agent; buyer contact fields and message; status `NEW | CONTACTED | QUALIFIED | CLOSED`; secure access token (stored hashed).  
- **ConversationMessage** — Thread per inquiry; sender `BUYER` or `AGENT`; timestamps.

---

## API surfaces

- **Public** — Browse listings, property detail, agent profile, submit inquiry.  
- **Buyer (token)** — View thread, reply, update own contact details.  
- **Agent (JWT)** — Profile, property CRUD, publish/sold, sold list, inquiries and messages.

---

## Security (intended model)

- Agents: **JWT**.  
- Buyers: **unguessable magic-link tokens** (hash at rest, not plaintext).  
- Rate limiting and captcha on inquiry creation; strict ownership on mutations; audit logging for sensitive actions.

---

## Philippines defaults

- Currency: **PHP**  
- Timezone: **Asia/Manila**  
- Address: region, province, city/municipality, barangay, postal code; optional lat/lng  

---

## MVP scope

1. Agent authentication and profile  
2. Property listing management  
3. Public listing browsing  
4. Anonymous inquiry with secure follow-up  

---

## Roadmap (from design doc)

| Sprint | Focus |
|--------|--------|
| **0** | Foundation: framework, Postgres migrations, JWT auth, API standards, CI/tests |
| **1** | Agent auth & profile (login/refresh/logout, profile, public agent endpoint) |
| **2** | Properties: CRUD, publish, public browse/filter, mark sold, sold view |
| **3** | Media: uploads, ordering, cover image, secure object storage |
| **4** | Inquiries & messaging: anonymous inquiry, magic link, inbox, messages, optional email |

**Future (examples):** SMS, analytics, multi-agent teams, scheduling, payments/reservations.

---

## Run locally

Backend (API only, skips frontend build per [`copilot/mvp.md`](copilot/mvp.md)):

```bash
mvn spring-boot:run -Dskip.frontend=true
```

Frontend (from repository root):

```bash
cd frontend
npm start
```

---

## Documentation

Full product and backend design: [`copilot/mvp.md`](copilot/mvp.md).
