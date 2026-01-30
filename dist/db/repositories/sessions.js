/**
 * Session repository: create or get active session for user.
 */
import { getPool } from "../client.js";
export async function createSession(userId) {
    const pool = getPool();
    const result = await pool.query(`INSERT INTO sessions (user_id) VALUES ($1)
     RETURNING id, user_id, created_at, updated_at`, [userId]);
    return result.rows[0];
}
export async function getById(sessionId) {
    const pool = getPool();
    const result = await pool.query("SELECT id, user_id, created_at, updated_at FROM sessions WHERE id = $1", [sessionId]);
    return result.rows[0] ?? null;
}
export async function getOrCreateForUser(userId) {
    const pool = getPool();
    const existing = await pool.query("SELECT id, user_id, created_at, updated_at FROM sessions WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1", [userId]);
    if (existing.rows[0])
        return existing.rows[0];
    return createSession(userId);
}
//# sourceMappingURL=sessions.js.map