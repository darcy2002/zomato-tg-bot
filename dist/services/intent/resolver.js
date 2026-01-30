const PATTERNS = [
    {
        intent: "discover_restaurants",
        keywords: [/restaurant|food|order|hungry|biryani|pizza|near|around|find|search|show me/i],
        entityExtract: (text) => {
            const query = text.replace(/near|around|me|find|search|show|restaurants?|food/gi, "").trim() || "food";
            return { query: query.slice(0, 100) };
        },
    },
    {
        intent: "view_menu",
        keywords: [/menu|dishes|what do you have|what can i order/i],
        entityExtract: (_text, ctx) => ({ restaurant_id: ctx.last_restaurant_id }),
    },
    {
        intent: "add_to_cart",
        keywords: [/add|put|order|get me|i want|i'll take|(\d+)\s*x\s+/i],
        entityExtract: (text) => {
            const qtyMatch = text.match(/(\d+)\s*x\s*([^,]+)/i) ?? text.match(/(\d+)\s+([^,]+)/i);
            const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
            const itemName = qtyMatch ? qtyMatch[2].trim() : text.replace(/add|put|to cart|please/gi, "").trim();
            return { quantity, item_name: itemName };
        },
    },
    {
        intent: "view_cart",
        keywords: [/cart|what.*in my (cart|order)|my order|checkout/i],
        entityExtract: () => ({}),
    },
    {
        intent: "clear_cart",
        keywords: [/clear|empty|remove all|cancel cart/i],
        entityExtract: () => ({}),
    },
    {
        intent: "place_order",
        keywords: [/place order|confirm|checkout|order now|done|submit/i],
        entityExtract: () => ({}),
    },
    {
        intent: "track_order",
        keywords: [/where is my order|track|status|delivery|when will it come/i],
        entityExtract: (_text, ctx) => ({ order_id: ctx.active_order_id }),
    },
];
export function resolve(message, context) {
    const normalized = message.trim();
    if (!normalized) {
        return { name: "fallback", confidence: 0, resolved_params: {} };
    }
    for (const { intent, keywords, entityExtract } of PATTERNS) {
        if (keywords.some((k) => k.test(normalized))) {
            const resolved_params = entityExtract?.(normalized, context) ?? {};
            return { name: intent, confidence: 0.85, resolved_params };
        }
    }
    return { name: "fallback", confidence: 0, resolved_params: {} };
}
//# sourceMappingURL=resolver.js.map