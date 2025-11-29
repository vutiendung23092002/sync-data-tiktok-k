import crypto from "crypto";
import { env } from "../../config/env.js";

const ALGO = "aes-256-cbc";
const SECRET_KEY = env.AES_256_CBC.APP_SECRET_KEY; // 32 bytes
const IV = crypto.randomBytes(16);

export function encrypt(text) {
  const cipher = crypto.createCipheriv(ALGO, Buffer.from(SECRET_KEY), IV);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return IV.toString("hex") + ":" + encrypted;
}

export function decrypt(encText) {
  const parts = encText.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];

  const decipher = crypto.createDecipheriv(ALGO, Buffer.from(SECRET_KEY), iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
