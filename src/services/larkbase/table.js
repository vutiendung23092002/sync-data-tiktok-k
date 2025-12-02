/**
 * Lấy danh sách toàn bộ bảng (tables) trong một Lark Base.
 *
 * Hàm này gọi endpoint:
 *   POST /open-apis/bitable/v1/apps/{baseId}/tables/query
 * thông qua SDK: `client.bitable.appTable.list()`
 *
 * Ứng dụng:
 * - Kiểm tra bảng tồn tại trước khi tạo mới
 * - Dò danh sách bảng để lấy table_id
 *
 * @async
 * @param {import('@larksuiteoapi/node-sdk').Client} client - Lark OpenAPI client đã được cấu hình app_id/app_secret
 * @param {string} baseId - ID của Base (thuộc tính app_token)
 * @returns {Promise<Object|null>}
 *    - Trả về response dạng:
 *        { data: { items: [...], page_token: null }, ... }
 *    - Trả về null nếu lỗi API (error response)
 */
export async function getListTable(client, baseId) {
  try {
    const res = await client.bitable.appTable.list({
      path: { app_token: baseId },
      params: { page_size: 100 },
    });
    return res;
  } catch (e) {
    console.error("Lỗi Lark API:", e.response?.data || e);
    return null;
  }
}

/**
 * Tạo bảng mới trong Lark Base nếu bảng chưa tồn tại.
 *
 * Hàm này dùng endpoint:
 *   POST /open-apis/bitable/v1/apps/{baseId}/tables
 *
 * Cấu trúc fields truyền vào:
 * [
 *   {
 *     field_name: "Tên cột",
 *     type: number (1=Text, 2=Number, 5=DateTime, ...),
 *     ui_type: "Text" | "Number" | "Currency" | ...,
 *     property: { ... }  // Optional
 *   }
 * ]
 *
 * Ứng dụng:
 * - Tạo bảng động khi đồng bộ TikTok / Supabase
 * - Generate bảng mới theo fieldMap của dự án
 *
 * @async
 * @param {import('@larksuiteoapi/node-sdk').Client} client - Lark OpenAPI client
 * @param {string} baseId - ID của Base
 * @param {string} tableName - Tên bảng muốn tạo
 * @param {Array<Object>} fields - Danh sách cấu hình field (schema)
 *
 * @returns {Promise<string>}
 *    - Trả về table_id của bảng vừa tạo
 *    - Throw error nếu API trả lỗi hoặc không tạo được bảng
 *
 * @throws {Error} Lỗi từ phía Lark API:
 *    - Thiếu quyền (insufficient permission)
 *    - Tên bảng trùng (duplicate table)
 *    - Schema không hợp lệ
 */
export async function ensureLarkBaseTable(client, baseId, tableName, fields) {
  try {
    const res = await client.bitable.appTable.create({
      path: { app_token: baseId },
      data: { table: { name: tableName, default_view_name: "Grid", fields } },
    });

    // if (!res?.data?.table_id) throw new Error("Không nhận được table_id");

    console.log(
      "SUCCESS:",
      `Đã tạo bảng '${tableName}' (ID: ${res.data.table_id})`
    );
    return res.data.table_id;
  } catch (err) {
    const errMsg = err.response?.data
      ? JSON.stringify(err.response.data, null, 2)
      : err.message;
    console.log("ERROR:", `Lỗi tạo bảng '${tableName}': ${errMsg}`);
    throw err;
  }
}
