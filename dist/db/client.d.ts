/**
 * PostgreSQL connection pool. Use for all DB access.
 */
import pg from "pg";
export declare function getPool(): pg.Pool;
export declare function closePool(): Promise<void>;
//# sourceMappingURL=client.d.ts.map