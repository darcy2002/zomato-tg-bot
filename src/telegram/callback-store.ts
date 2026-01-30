/**
 * In-memory store for callback_data. Telegram limits callback_data to 64 bytes,
 * so we store full payload here and pass a short id in the button.
 */
import { randomBytes } from "crypto";

export interface StoredCallback {
  session_id: string;
  action: string;
  params: Record<string, unknown>;
}

const store = new Map<string, StoredCallback>();

const ID_LENGTH = 12;

function generateId(): string {
  return randomBytes(ID_LENGTH).toString("base64url");
}

export function storeCallback(payload: StoredCallback): string {
  let id = generateId();
  while (store.has(id)) id = generateId();
  store.set(id, payload);
  return id;
}

export function getCallback(id: string): StoredCallback | undefined {
  return store.get(id);
}

export function deleteCallback(id: string): void {
  store.delete(id);
}
