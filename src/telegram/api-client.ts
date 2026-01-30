/**
 * Thin HTTP client for the backend API. Used by the Telegram bot only.
 */
export interface SessionResponse {
  session_id: string;
  user_id: string;
  created_at: string;
}

export interface SuggestedAction {
  id: string;
  label: string;
  action: string;
  params: Record<string, unknown>;
}

export interface ConversationResponse {
  reply: { text: string; type: string };
  intent: { name: string; confidence: number; resolved_params: Record<string, unknown> };
  data?: Record<string, unknown>;
  suggested_actions: SuggestedAction[];
  context_updated: boolean;
}

export class BackendApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "BackendApiError";
  }
}

export function createApiClient(baseUrl: string) {
  const base = baseUrl.replace(/\/$/, "");
  const api = `${base}/api/v1`;

  async function request<T>(
    method: string,
    path: string,
    body?: object
  ): Promise<T> {
    const res = await fetch(`${api}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const text = await res.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : undefined;
    } catch {
      data = text;
    }
    if (!res.ok) {
      throw new BackendApiError(
        (data as { error?: { message?: string } })?.error?.message ?? res.statusText,
        res.status,
        data
      );
    }
    return data as T;
  }

  return {
    async createOrGetSession(channel: string, channelUserId: string): Promise<SessionResponse> {
      return request<SessionResponse>("POST", "/sessions", {
        channel,
        channel_user_id: channelUserId,
      });
    },

    async sendMessage(sessionId: string, message: string): Promise<ConversationResponse> {
      return request<ConversationResponse>("POST", "/conversation/message", {
        session_id: sessionId,
        message,
      });
    },

    async executeAction(
      sessionId: string,
      action: string,
      params: Record<string, unknown>
    ): Promise<ConversationResponse> {
      return request<ConversationResponse>("POST", "/conversation/execute", {
        session_id: sessionId,
        action,
        params: params ?? {},
      });
    },
  };
}
