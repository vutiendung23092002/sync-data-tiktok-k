import crypto from "crypto";

/**
 * Tạo hash SHA-256 ổn định (deterministic) từ một object bất kỳ.
 *
 * Cơ chế hoạt động:
 * 1. Sắp xếp các key theo alphabet để đảm bảo cùng 1 object nhưng khác thứ tự key vẫn ra cùng hash.
 * 2. Convert toàn bộ value:
 *    - undefined → null (để tránh mất key khi stringify)
 *    - object (bao gồm array) → JSON.stringify để đảm bảo hash không lệch cấu trúc
 *    - primitive giữ nguyên
 * 3. Stringify object đã chuẩn hoá rồi tạo hash SHA-256 dạng hex.
 *
 * Dùng khi:
 * - Cần kiểm tra dữ liệu TikTok (orders, items, transactions) có thay đổi hay không.
 * - Lưu vào Supabase / Lark để diff trước khi insert/update.
 *
 * @function generateHash
 *
 * @param {Object} [obj={}] - Object cần tạo mã băm
 * @returns {string} Hash SHA-256 dạng hex. Trả về chuỗi rỗng nếu input không hợp lệ.
 *
 * @example
 * const hash = generateHash({ id: 1, amount: 200 });
 * console.log(hash); // "a94c3f...."
 *
 * @example
 * generateHash({ b: 1, a: 2 }) === generateHash({ a: 2, b: 1 }); // true
 */
export function generateHash(obj = {}) {
  if (!obj || typeof obj !== "object") return "";

  // Chuẩn hoá object: sắp xếp key để hash luôn ổn định (deterministic hash)
  const sorted = Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      const value = obj[key];
      if (value === undefined) acc[key] = null;
      else if (typeof value === "object" && value !== null)
        acc[key] = JSON.stringify(value);
      else acc[key] = value;
      return acc;
    }, {});

  const jsonString = JSON.stringify(sorted);

  // console.log("Hash input:", jsonString);

  // Tạo hash SHA256 dạng hex
  return crypto.createHash("sha256").update(jsonString).digest("hex");
}
