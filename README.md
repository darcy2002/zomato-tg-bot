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
   # Set DATABASE_URL; optionally OPENAI_API_KEY, ZOMATO_MCP_URL; for Telegram set TELEGRAM_BOT_TOKEN and BACKEND_URL
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

## Telegram Bot

The Telegram bot is a thin client in the same repo. It can run in two modes:

### Gemini CLI mode (recommended when Zomato OAuth is restricted)

Messages are sent to **Google Gemini CLI** via a single persistent interactive session (PTY); Gemini can use the Zomato MCP server (whitelisted for Gemini). The CLI’s reply is sent back to the user on Telegram. No API server or backend is required for replies. One process keeps full context and avoids cold starts after the first message.

1. **Install and authenticate Gemini CLI** (see [Gemini CLI](https://google-gemini.github.io/gemini-cli/)). Ensure Zomato MCP is configured for Gemini as in the [blog](https://medium.com/google-cloud/ordering-food-using-zomatos-mcp-server-with-google-gemini-cli-e80c0f86ef30).
2. **Set env** in `.env`:
   - `TELEGRAM_BOT_TOKEN=...` (from [@BotFather](https://t.me/BotFather))
   - `GEMINI_CLI_PATH=gemini` (or `GEMINI_CLI_PATH=npx` to use `npx @google/gemini-cli`)
   - `DATABASE_URL=...` (still required by config; use a placeholder if you only run the bot)
3. **Run only the bot**: `npm run dev:telegram`. A **single persistent Gemini CLI process** is started (interactive mode via PTY). Users send text → bot forwards the message to that process → reply is shown on Telegram. **Context:** the same process handles all messages, so Gemini keeps full conversation context (e.g. address and restaurant selected). **Latency:** the first message may take a few seconds while the process warms up; later messages are much faster because there is no cold start per message.

### Backend API mode

The bot calls the REST API for intent resolution, discovery, cart, and orders; replies and inline keyboards come from the backend.

1. **Set env**: `TELEGRAM_BOT_TOKEN=...`, `BACKEND_URL=http://localhost:3000`
2. **Run the API server** in one terminal: `npm run dev`
3. **Run the bot** in another: `npm run dev:telegram`

Users send text → backend returns reply and suggested actions → bot shows reply and inline buttons; tapping a button calls `/conversation/execute` and shows the next reply.

## Project Structure

```
src/
├── config/           # Env config (Zod)
├── db/               # PG client, migrations, repositories
├── mcp/              # Zomato MCP client and tool wrappers
├── services/         # Session, intent pipeline, discovery, cart, order
├── routes/           # Fastify route modules
├── schemas/          # JSON Schema for validation
├── telegram/         # Telegram bot (Telegraf): api-client, bot, callback-store, config
├── middleware/       # Error handler
├── lib/              # Errors, shared types
├── index.ts          # API server entry
└── telegram/index.ts # Bot entry (npm run dev:telegram)
```

## Core Principles

- **All business logic behind REST APIs** — No Telegram-specific flows in core services.
- **Stateless frontends** — Clients send `session_id` and display API responses; conversation state lives in PostgreSQL.
- **Backend-driven conversation** — Intent resolution and suggested actions are computed server-side.
- **Reusable, deterministic, idempotent** — Same request → same outcome; use `idempotency_key` for place order.

## Zomato MCP

The [Zomato MCP server](https://github.com/Zomato/mcp-server-manifest) exposes restaurant discovery, menu browsing, cart, and order placement. This backend calls it via the Model Context Protocol (Streamable HTTP). **Zomato currently whitelists only certain OAuth redirect URIs** (e.g. Claude, ChatGPT, VSCode, Gemini); requests from localhost or your own domain may be rejected. **To use Zomato from the Telegram bot without being whitelisted**, run the bot in **Gemini CLI mode** (`GEMINI_CLI_PATH=gemini`): the bot sends each user message to Gemini CLI, which can call Zomato MCP (Gemini is whitelisted), and the CLI’s reply is shown on Telegram. When using the backend API and the Zomato MCP call fails, the app **falls back to stub data**: sample restaurants and a sample menu are returned, and the bot reply explains that Zomato isn’t available. Check the server logs for `[discover_restaurants] Zomato MCP failed:` or `[view_menu] Zomato MCP failed:` to see the actual error. MCP tool names in `src/mcp/tools.ts` are placeholders; align with the Zomato manifest when building against the live server.

## License

MIT (or as specified in the repo).
