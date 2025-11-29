import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

/**
 * Kết nối Postgres/Supabase bằng thư viện `postgres` (node-postgres mới).
 *
 * Client này:
 * - Hỗ trợ async/await
 * - Không dùng connection pool mặc định của pg, mà dùng connection pooling riêng
 * - Tự động chuẩn hóa dữ liệu trả về dạng object
 * - Dùng để query SQL trực tiếp trong toàn dự án
 *
 * Ví dụ sử dụng:
 *   const rows = await sql`SELECT * FROM orders WHERE id = ${id}`;
 *   await sql`INSERT INTO logs (message) VALUES (${msg})`;
 *
 * @type {postgres.Sql<any>}
 */
const SUPABASE_URL = "https://srvzxxoazxabhutjutbk.supabase.co";
export const supabase = createClient(SUPABASE_URL, env.SUPABASE.SERVICE_KEY);