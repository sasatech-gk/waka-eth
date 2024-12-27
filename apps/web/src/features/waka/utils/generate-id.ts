import { customAlphabet } from "nanoid";

// Create a custom ID generator with a specific alphabet
const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 16);

export function generateId(): string {
  return nanoid();
}
