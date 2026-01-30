/**
 * PostgreSQL connection pool. Use for all DB access.
 */
import pg from "pg";
import { config } from "../config/index.js";
const { Pool } = pg;
let pool = null;
export function getPool() {
    if (!pool) {
        pool = new Pool({
            connectionString: config.DATABASE_URL,
            max: 10,
            idleTimeoutMillis: 30000,
        });
    }
    return pool;
}
export async function closePool() {
    if (pool) {
        await pool.end();
        pool = null;
    }
}
//# sourceMappingURL=client.js.map