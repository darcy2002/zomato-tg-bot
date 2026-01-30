/**
 * Conversation state repository: per-session context for intent resolution.
 */
import { getPool } from "../client.js";
export async function get(sessionId) {
    const pool = getPool();
    const result = await pool.query("SELECT session_id, state, updated_at FROM conversation_state WHERE session_id = $1", [sessionId]);
    return result.rows[0] ?? null;
}
export async function upsert(sessionId, state) {
    const pool = getPool();
    const result = await pool.query(`INSERT INTO conversation_state (session_id, state)
     VALUES ($1, $2)
     ON CONFLICT (session_id)
     DO UPDATE SET state = $2, updated_at = now()
     RETURNING session_id, state, updated_at`, [sessionId, JSON.stringify(state)]);
    return result.rows[0];
}
export async function merge(sessionId, patch) {
    const existing = await get(sessionId);
    const current = (existing?.state ?? {});
    const next = { ...current, ...patch };
    return upsert(sessionId, next);
}
//# sourceMappingURL=conversation_state.js.map