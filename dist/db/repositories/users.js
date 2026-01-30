/**
 * User repository: create or get by channel + channel_user_id.
 */
import { getPool } from "../client.js";
export async function findOrCreateUser(channel, channelUserId) {
    const pool = getPool();
    const result = await pool.query(`INSERT INTO users (channel, channel_user_id)
     VALUES ($1, $2)
     ON CONFLICT (channel, channel_user_id)
     DO UPDATE SET updated_at = now()
     RETURNING id, channel, channel_user_id, created_at, updated_at`, [channel, channelUserId]);
    return result.rows[0];
}
export async function getById(id) {
    const pool = getPool();
    const result = await pool.query("SELECT id, channel, channel_user_id, created_at, updated_at FROM users WHERE id = $1", [id]);
    return result.rows[0] ?? null;
}
//# sourceMappingURL=users.js.map