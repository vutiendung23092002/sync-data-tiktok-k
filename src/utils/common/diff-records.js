/**
 * So sánh sự khác biệt giữa dữ liệu mới và dữ liệu cũ để xác định
 * record nào cần INSERT, UPDATE hoặc UPSERT.
 *
 * Hàm dùng hash để biết record có thay đổi nội dung hay không.
 * Logic hoạt động:
 *  - Nếu ID không tồn tại trong oldRecords → thêm mới (INSERT)
 *  - Nếu ID tồn tại nhưng hash khác nhau → cập nhật (UPDATE)
 *  - Kết hợp cả 2 loại → danh sách cần UPSERT
 *
 * @function diffRecords
 *
 * @param {Array<Object>} newRecords - Danh sách record mới từ API (bắt buộc phải có id và hash).
 * @param {Array<Object>|Object<string,string|null>} oldRecords
 *   Dữ liệu cũ:
 *   - Có thể là array (list bản ghi từ Lark/Supabase)
 *   - Hoặc object dạng map: { id: hash }
 * @param {string} idKey - Tên field định danh (VD: "id", "order_id", "item_id").
 * @param {string} hashKey - Tên field hash để kiểm tra thay đổi.
 * @param {string} [label=""] - Nhãn hiển thị trong log để debug (VD: "Orders").
 *
 * @returns {{
 *   toUpsert: Array<Object>,
 *   toInsert: Array<Object>,
 *   toUpdate: Array<Object>
 * }}
 * Kết quả gồm:
 *  - `toInsert`: Những record hoàn toàn chưa tồn tại → cần INSERT
 *  - `toUpdate`: Những record trùng ID nhưng hash khác → cần UPDATE
 *  - `toUpsert`: Gộp cả hai loại trên
 *
 * @example
 * const diff = diffRecords(
 *   [{ id: 1, hash: "abc" }, { id: 2, hash: "xyz" }],
 *   [{ id: 1, hash: "abc" }],
 *   "id",
 *   "hash",
 *   "Orders"
 * );
 * // diff.toInsert → [{ id: 2, hash: "xyz" }]
 * // diff.toUpdate → []
 * // diff.toUpsert → [{ id: 2, hash: "xyz" }]
 */

export function diffRecords(newRecords, oldRecords, idKey, hashKey, label = "") {
    const oldMap = Array.isArray(oldRecords)
        ? Object.fromEntries(
            oldRecords.map((r) => [
                String(r[idKey]),
                r[hashKey] === undefined || r[hashKey] === null ? null : String(r[hashKey]),
            ])
        )
        : oldRecords || {};

    const toInsert = [];
    const toUpdate = [];

    for (const record of newRecords) {
        const id = String(record[idKey]).trim();
        const newHash =
            record[hashKey] === undefined || record[hashKey] === null
                ? null
                : String(record[hashKey]).trim();
        const oldHash = oldMap[id];

        if (!(id in oldMap)) {
            toInsert.push(record);
        } else if (oldHash !== newHash) {
            toUpdate.push(record);
        }
    }

    const toUpsert = [...toInsert, ...toUpdate];

    console.log(
        `Diff summary [${label}] (${idKey}):
  - Thêm mới: ${toInsert.length}
  - Cập nhật: ${toUpdate.length}
  - Tổng upsert: ${toUpsert.length}`
    );

    return { toUpsert, toInsert, toUpdate };
}
