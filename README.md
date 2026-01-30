# Zomato Food Ordering Backend (API-First)

Node.js (TypeScript) backend for a Telegram bot that allows users to order food from Zomato using natural language. The backend is **API-first**: all business logic lives in REST APIs; the Telegram bot and future Web frontend are thin, stateless clients.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Fastify (REST APIs, JSON Schema validation)
- **Language**: TypeScript
- **Database**: PostgreSQL (sessions, conversation state, carts, orders)
- **External**: Zomato MCP server (restaurant discovery, menu, cart, order placement)

## Design

- **[docs/DESIGN.md](docs/DESIGN.md)** — High-level system design, API-first architecture, DB schema, folder structure, intent resolution pipeline, MCP integration flow, and example end-to-end API sequence.
- **[docs/API.md](docs/API.md)** — REST API reference (routes, request/response, error codes).

## Quick Start

1. **Environment**

   ```bash
   cp .env.example .env
   # Set DATABASE_URL; optionally OPENAI_API_KEY (for LLM intent recognition) and ZOMATO_MCP_URL
   ```

   **Intent recognition:** If `OPENAI_API_KEY` is set, natural-language intent resolution uses OpenAI (GPT-4o-mini). If unset or the API fails, the pipeline falls back to rule-based (regex) resolution.

2. **Database**

   Create a PostgreSQL database and run migrations:

   ```bash
   psql $DATABASE_URL -f src/db/migrations/001_initial.sql
   ```

3. **Install and run**

   ```bash
   npm install
   npm run dev
   ```

   Server listens on `http://0.0.0.0:3000`. API base path: `/api/v1`.

4. **Health**

   - `GET /health` — Liveness
   - `GET /health/ready` — Readiness (DB check)

## Project Structure

```
src/
├── config/           # Env config (Zod)
├── db/               # PG client, migrations, repositories
├── mcp/              # Zomato MCP client and tool wrappers
├── services/         # Session, intent pipeline, discovery, cart, order
├── routes/           # Fastify route modules
├── schemas/          # JSON Schema for validation
├── middleware/       # Error handler
├── lib/              # Errors, shared types
└── index.ts          # App entry
```

## Core Principles

- **All business logic behind REST APIs** — No Telegram-specific flows in core services.
- **Stateless frontends** — Clients send `session_id` and display API responses; conversation state lives in PostgreSQL.
- **Backend-driven conversation** — Intent resolution and suggested actions are computed server-side.
- **Reusable, deterministic, idempotent** — Same request → same outcome; use `idempotency_key` for place order.

## Zomato MCP

The [Zomato MCP server](https://github.com/Zomato/mcp-server-manifest) exposes restaurant discovery, menu browsing, cart, and order placement. This backend calls it via the Model Context Protocol (Streamable HTTP). MCP tool names in `src/mcp/tools.ts` are placeholders; align with the Zomato manifest when building against the live server. OAuth may be required for production; add token handling in `src/mcp/client.ts` when needed.

## License

MIT (or as specified in the repo).
