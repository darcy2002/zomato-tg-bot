import type { ConversationContext, ResolvedIntent, SuggestedAction } from "./types.js";
export interface PipelineInput {
    sessionId: string;
    message?: string;
    action?: string;
    params?: Record<string, unknown>;
}
export interface PipelineOutput {
    reply: {
        text: string;
        type: "text";
    };
    intent: ResolvedIntent;
    data?: Record<string, unknown>;
    suggested_actions: SuggestedAction[];
    context_updated: boolean;
}
export declare function loadContext(sessionId: string): Promise<ConversationContext>;
export declare function resolveIntent(message: string | undefined, action: string | undefined, params: Record<string, unknown> | undefined, context: ConversationContext): Promise<ResolvedIntent>;
export declare function runPipeline(input: PipelineInput): Promise<PipelineOutput>;
//# sourceMappingURL=pipeline.d.ts.map