/**
 * Chuẩn hóa giá trị theo kiểu dữ liệu mà LarkBase yêu cầu.
 *
 * Công dụng:
 * - Dùng chung cho mọi bảng (Orders, OrderItems, GMV, Finance...).
 * - LarkBase yêu cầu đúng type (text/number/json/datetime/boolean) khi upsert.
 *
 * Quy tắc chuẩn hóa:
 * - Null/undefined/"" → null.
 * - type = 2 (number) → convert Number(value), invalid → null.
 * - type = 5 (datetime) → convert sang timestamp ms (Epoch milliseconds).
 * - type = 3 (boolean) → Boolean(value).
 * - type = 4 (json) → stringify object hoặc giữ nguyên string JSON.
 * - default (text) → convert về string; nếu object → stringify.
 *
 * @function normalizeFieldValue
 * @param {number} type - Kiểu dữ liệu LarkBase:
 *   1=text, 2=number, 3=boolean, 4=json, 5=datetime.
 * @param {*} value - Giá trị raw từ TikTok/Supabase.
 * @returns {*} Giá trị đã chuẩn hóa theo đúng type LarkBase.
 *
 * @example
 * normalizeFieldValue(2, "123");  // → 123
 * normalizeFieldValue(5, "2025-01-20T10:00:00Z"); // → 1737367200000
 */
function normalizeFieldValue(type, value) {
  if (value === null || value === undefined || value === "") return null;

  switch (type) {
    case 2: // number
      return isNaN(value) ? null : Number(value);

    case 5: // datetime
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d.getTime();

    case 3: // boolean
      return Boolean(value);

    case 4: // json
      try {
        return typeof value === "object" ? JSON.stringify(value) : value;
      } catch {
        return null;
      }

    default: // text
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
  }
}

/**
 * Chuyển đổi 1 object dữ liệu gốc thành định dạng chuẩn "fields"
 * để push lên LarkBase.
 *
 * Cách hoạt động:
 * - Duyệt toàn bộ fieldMap (key → label).
 * - Lấy giá trị tương ứng trong item[key].
 * - Chuẩn hóa value bằng normalizeFieldValue() theo typeMap[key].
 * - Trả về object dạng:
 *   {
 *      fields: {
 *         "Tên cột trên Lark": giá_trị_chuẩn_hoá,
 *         ...
 *      }
 *   }
 *
 * Công dụng:
 * - Dùng cho mọi loại bảng: Orders, OrderItems, Transactions, GMV...
 *
 * @function mapFieldsToLark
 * @param {Object} item - Bản ghi raw từ TikTok/Supabase.
 * @param {Object} fieldMap - Map key → label trên LarkBase.
 * @param {Object} typeMap - Map key → type LarkBase.
 * @returns {{ fields: Object }} Object chứa fields chuẩn cho API Lark.
 *
 * @example
 * mapFieldsToLark(
 *   { id: 123, cost: "50000" },
 *   { id: "ID", cost: "Chi phí" },
 *   { id: 1, cost: 2 }
 * );
 * // → { fields: { ID: "123", "Chi phí": 50000 } }
 */
export function mapFieldsToLark(item, fieldMap, typeMap) {
  const fields = {};

  for (const [key, label] of Object.entries(fieldMap)) {
    const value = item[key];

    if (value !== undefined && value !== null) {
      const type = typeMap[key] ?? 1; // default text
      fields[label] = normalizeFieldValue(type, value);
    }
  }

  return { fields };
}

/**
 * Trích xuất danh sách { id, hash, record_id } từ danh sách record lấy từ LarkBase.
 *
 * Cách hoạt động:
 * - Mỗi record từ LarkBase có dạng: { record_id, fields: {...} }.
 * - Hàm sẽ đọc:
 *     + idLabel (mặc định "ID định danh (TTS)")
 *     + hash
 *   bên trong `fields`.
 * - Value của Lark có thể là:
 *     + text object: { text, value }
 *     + array: [{ text }] (Rich text)
 *     + string thường
 *   → Tất cả đều được normalize về string sạch.
 *
 * Công dụng:
 * - Chuẩn hóa để compare với dữ liệu mới khi diffRecords().
 * - Trả về danh sách:
 *   [
 *     { record_id: "xxx", id: "123", hash: "abc" }
 *   ]
 *
 * @function extractLarkIdHash
 * @param {Array<Object>} items - Danh sách records trả về từ Lark API.
 * @param {string} [idLabel="ID định danh (TTS)"]
 *        Tên cột ID định danh trong LarkBase.
 * @returns {Array<{ record_id: string, id: string, hash: string|null }>}
 *
 * @example
 * extractLarkIdHash(
 *   [
 *     {
 *       record_id: "rec123",
 *       fields: {
 *         "ID định danh (TTS)": [{ text: "A123" }],
 *         hash: "xyz"
 *       }
 *     }
 *   ]
 * );
 * // → [{ record_id: "rec123", id: "A123", hash: "xyz" }]
 */
export function extractLarkIdHash(items, idLabel = "ID định danh (TTS)") {
  const normalize = (val) => {
    if (!val) return null;

    if (Array.isArray(val)) {
      const text = val[0]?.text ?? val[0]?.value ?? "";
      return String(text).trim().replace(/\r|\n/g, "") || null;
    }

    if (typeof val === "object") {
      const text = val.text ?? val.value ?? "";
      return String(text).trim().replace(/\r|\n/g, "") || null;
    }

    return String(val).trim().replace(/\r|\n/g, "") || null;
  };

  return items
    .map((rec) => {
      const f = rec.fields || {};
      const id = normalize(f[idLabel]);
      const hash = normalize(f["hash"]);

      return {
        record_id: rec.record_id,
        id,
        hash: hash || null, // Giữ lại record có hash null
      };
    })
    .filter((r) => r.id); // Bỏ record không có ID
}
