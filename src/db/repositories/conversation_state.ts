/**
 * Conversation state repository: per-session context for intent resolution.
 */
import { getPool } from "../client.js";

export interface ConversationStateRow {
  session_id: string;
  state: Record<string, unknown>;
  updated_at: Date;
}

export async function get(sessionId: string): Promise<ConversationStateRow | null> {
  const pool = getPool();
  const result = await pool.query<ConversationStateRow>(
    "SELECT session_id, state, updated_at FROM conversation_state WHERE session_id = $1",
    [sessionId]
  );
  return result.rows[0] ?? null;
}

export async function upsert(
  sessionId: string,
  state: Record<string, unknown>
): Promise<ConversationStateRow> {
  const pool = getPool();
  const result = await pool.query<ConversationStateRow>(
    `INSERT INTO conversation_state (session_id, state)
     VALUES ($1, $2)
     ON CONFLICT (session_id)
     DO UPDATE SET state = $2, updated_at = now()
     RETURNING session_id, state, updated_at`,
    [sessionId, JSON.stringify(state)]
  );
  return result.rows[0];
}

export async function merge(
  sessionId: string,
  patch: Record<string, unknown>
): Promise<ConversationStateRow> {
  const existing = await get(sessionId);
  const current = (existing?.state ?? {}) as Record<string, unknown>;
  const next = { ...current, ...patch };
  return upsert(sessionId, next);
}
