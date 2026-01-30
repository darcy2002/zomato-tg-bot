/**
 * User repository: create or get by channel + channel_user_id.
 */
import { getPool } from "../client.js";

export interface User {
  id: string;
  channel: string;
  channel_user_id: string;
  created_at: Date;
  updated_at: Date;
}

export async function findOrCreateUser(
  channel: string,
  channelUserId: string
): Promise<User> {
  const pool = getPool();
  const result = await pool.query<User>(
    `INSERT INTO users (channel, channel_user_id)
     VALUES ($1, $2)
     ON CONFLICT (channel, channel_user_id)
     DO UPDATE SET updated_at = now()
     RETURNING id, channel, channel_user_id, created_at, updated_at`,
    [channel, channelUserId]
  );
  return result.rows[0];
}

export async function getById(id: string): Promise<User | null> {
  const pool = getPool();
  const result = await pool.query<User>(
    "SELECT id, channel, channel_user_id, created_at, updated_at FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0] ?? null;
}
