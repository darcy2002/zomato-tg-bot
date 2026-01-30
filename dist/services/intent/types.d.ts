/**
 * Intent resolution types: NLU output and canonical actions.
 */
export declare const INTENTS: readonly ["discover_restaurants", "view_menu", "add_to_cart", "view_cart", "update_cart_item", "clear_cart", "place_order", "track_order", "fallback"];
export type IntentName = (typeof INTENTS)[number];
export interface ResolvedIntent {
    name: IntentName;
    confidence: number;
    resolved_params: Record<string, unknown>;
}
export interface ConversationContext {
    last_restaurant_id?: string;
    last_menu_at?: string;
    cart_item_count?: number;
    active_order_id?: string;
    default_lat?: number;
    default_lon?: number;
}
export interface SuggestedAction {
    id: string;
    label: string;
    action: string;
    params: Record<string, unknown>;
}
//# sourceMappingURL=types.d.ts.map