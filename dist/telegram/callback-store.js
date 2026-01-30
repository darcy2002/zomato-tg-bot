/**
 * In-memory store for callback_data. Telegram limits callback_data to 64 bytes,
 * so we store full payload here and pass a short id in the button.
 */
import { randomBytes } from "crypto";
const store = new Map();
const ID_LENGTH = 12;
function generateId() {
    return randomBytes(ID_LENGTH).toString("base64url");
}
export function storeCallback(payload) {
    let id = generateId();
    while (store.has(id))
        id = generateId();
    store.set(id, payload);
    return id;
}
export function getCallback(id) {
    return store.get(id);
}
export function deleteCallback(id) {
    store.delete(id);
}
//# sourceMappingURL=callback-store.js.map