export interface StoredCallback {
    session_id: string;
    action: string;
    params: Record<string, unknown>;
}
export declare function storeCallback(payload: StoredCallback): string;
export declare function getCallback(id: string): StoredCallback | undefined;
export declare function deleteCallback(id: string): void;
//# sourceMappingURL=callback-store.d.ts.map