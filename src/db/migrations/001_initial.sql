-- Zomato Food Ordering Backend — Initial Schema
-- Run against PostgreSQL. All timestamps UTC (TIMESTAMPTZ).

-- Extensions (optional; enable if using uuid-ossp for gen_random_uuid on older PG)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users: our identity; keyed by channel + channel_user_id
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel VARCHAR(32) NOT NULL,
  channel_user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (channel, channel_user_id)
);

CREATE INDEX idx_users_channel_channel_user_id ON users (channel, channel_user_id);

-- Sessions: one active session per user (or more if multi-device later)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_user_id ON sessions (user_id);

-- Conversation state: per-session context for intent resolution and MCP
CREATE TABLE conversation_state (
  session_id UUID PRIMARY KEY REFERENCES sessions (id) ON DELETE CASCADE,
  state JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Carts: one active cart per session; Zomato cart id for MCP sync
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE REFERENCES sessions (id) ON DELETE CASCADE,
  restaurant_id VARCHAR(64) NOT NULL,
  zomato_cart_id VARCHAR(255),
  items_snapshot JSONB NOT NULL DEFAULT '[]',
  subtotal_cents INT NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_carts_session_id ON carts (session_id);

-- Orders: placed orders; idempotency and Zomato reference
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  zomato_order_id VARCHAR(255),
  idempotency_key VARCHAR(255) UNIQUE,
  status VARCHAR(32) NOT NULL DEFAULT 'placed',
  delivery_address JSONB NOT NULL,
  items_snapshot JSONB NOT NULL DEFAULT '[]',
  total_cents INT NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  estimated_delivery_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_session_id ON orders (session_id);
CREATE INDEX idx_orders_user_id ON orders (user_id);
CREATE INDEX idx_orders_idempotency_key ON orders (idempotency_key) WHERE idempotency_key IS NOT NULL;

-- Optional: user delivery address / profile for default address
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  default_delivery_address JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
