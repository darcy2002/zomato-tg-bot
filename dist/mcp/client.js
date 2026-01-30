/**
 * MCP client for Zomato. Uses Streamable HTTP transport.
 * When Zomato MCP requires OAuth, inject per-session tokens here.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { config } from "../config/index.js";
let client = null;
export async function getZomatoMcpClient() {
    if (client)
        return client;
    const url = config.ZOMATO_MCP_URL;
    if (!url) {
        throw new Error("ZOMATO_MCP_URL is not set");
    }
    const transport = new StreamableHTTPClientTransport(new URL(url));
    client = new Client({ name: "zomato-bot", version: "0.1.0" });
    await client.connect(transport);
    return client;
}
export async function callZomatoTool(name, args) {
    const c = await getZomatoMcpClient();
    const result = await c.callTool({ name, arguments: args });
    if (result.isError) {
        throw new Error(result.content?.[0]?.text ?? "MCP tool error");
    }
    const text = result.content?.[0]?.type === "text" ? result.content[0].text : "";
    try {
        return JSON.parse(text);
    }
    catch {
        return text;
    }
}
export async function listZomatoTools() {
    const c = await getZomatoMcpClient();
    const list = await c.listTools();
    return list.tools.map((t) => ({ name: t.name, description: t.description }));
}
//# sourceMappingURL=client.js.map