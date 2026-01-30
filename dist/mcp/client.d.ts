/**
 * MCP client for Zomato. Uses Streamable HTTP transport.
 * When Zomato MCP requires OAuth, inject per-session tokens here.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
export declare function getZomatoMcpClient(): Promise<Client>;
export declare function callZomatoTool<T = unknown>(name: string, args: Record<string, unknown>): Promise<T>;
export declare function listZomatoTools(): Promise<{
    name: string;
    description?: string;
}[]>;
//# sourceMappingURL=client.d.ts.map