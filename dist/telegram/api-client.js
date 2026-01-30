export class BackendApiError extends Error {
    statusCode;
    body;
    constructor(message, statusCode, body) {
        super(message);
        this.statusCode = statusCode;
        this.body = body;
        this.name = "BackendApiError";
    }
}
export function createApiClient(baseUrl) {
    const base = baseUrl.replace(/\/$/, "");
    const api = `${base}/api/v1`;
    async function request(method, path, body) {
        const res = await fetch(`${api}${path}`, {
            method,
            headers: { "Content-Type": "application/json" },
            ...(body ? { body: JSON.stringify(body) } : {}),
        });
        const text = await res.text();
        let data;
        try {
            data = text ? JSON.parse(text) : undefined;
        }
        catch {
            data = text;
        }
        if (!res.ok) {
            throw new BackendApiError(data?.error?.message ?? res.statusText, res.status, data);
        }
        return data;
    }
    return {
        async createOrGetSession(channel, channelUserId) {
            return request("POST", "/sessions", {
                channel,
                channel_user_id: channelUserId,
            });
        },
        async sendMessage(sessionId, message) {
            return request("POST", "/conversation/message", {
                session_id: sessionId,
                message,
            });
        },
        async executeAction(sessionId, action, params) {
            return request("POST", "/conversation/execute", {
                session_id: sessionId,
                action,
                params: params ?? {},
            });
        },
    };
}
//# sourceMappingURL=api-client.js.map