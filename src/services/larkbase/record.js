import * as utils from "../../utils/index.js";

/**
 * Lấy toàn bộ bản ghi trong 1 bảng Lark Base (không filter).
 *
 * Hàm này dùng `searchWithIterator` để auto load toàn bộ page
 * cho tới khi hết dữ liệu. Rất phù hợp khi:
 * - Cần đồng bộ toàn bộ bảng về local
 * - Cần đọc dữ liệu để diff
 *
 * @async
 * @param {import("@larksuiteoapi/node-sdk").Client} client - Lark OpenAPI client
 * @param {string} baseId - ID của Lark Base (app_token)
 * @param {string} tableId - ID của bảng (table_id)
 * @param {number} [pageSize=1000] - Số bản ghi mỗi trang (tối đa Lark cho phép)
 * @returns {Promise<Array<Object>>} Danh sách toàn bộ records (flatten)
 */
export async function searchLarkRecords(
  client,
  baseId,
  tableId,
  pageSize = 1000
) {
  const records = [];

  for await (const page of await client.bitable.appTableRecord.searchWithIterator(
    {
      path: { app_token: baseId, table_id: tableId },
      params: { user_id_type: "open_id", page_size: pageSize },
    }
  )) {
    if (page.items && page.items.length > 0) {
      records.push(...page.items);
    }
  }

  return records;
}

/**
 * Lọc bản ghi theo khoảng ngày trong 1 trường Date/DateTime.
 *
 * Lark Base yêu cầu format filter dạng:
 *  {
 *    filter: {
 *      conjunction: "and",
 *      conditions: [
 *        { field_name, operator: "isGreater", value: ["ExactDate", from] },
 *        { field_name, operator: "isLess",    value: ["ExactDate", to]   }
 *      ]
 *    }
 *  }
 *
 * @async
 * @param {import("@larksuiteoapi/node-sdk").Client} client - Lark OpenAPI client
 * @param {string} baseId - Base ID (app_token)
 * @param {string} tableId - Table ID
 * @param {number} pageSize - Số bản ghi mỗi trang
 * @param {string} fieldName - Tên trường date cần filter
 * @param {string|number} from - Giá trị từ (ExactDate)
 * @param {string|number} to - Giá trị đến (ExactDate)
 * @returns {Promise<Array<Object>>} Danh sách bản ghi thỏa điều kiện
 */
export async function searchLarkRecordsFilterDate(
  client,
  baseId,
  tableId,
  pageSize,
  fieldName,
  from,
  to
) {
  const records = [];

  let pageToken = undefined;

  while (true) {
    const res = await client.bitable.appTableRecord.search({
      path: { app_token: baseId, table_id: tableId },
      params: {
        user_id_type: "open_id",
        page_size: pageSize,
        page_token: pageToken,
      },
      data: {
        filter: {
          conjunction: "and",
          conditions: [
            {
              field_name: fieldName,
              operator: "isGreater",
              value: ["ExactDate", from],
            },
            {
              field_name: fieldName,
              operator: "isLess",
              value: ["ExactDate", to],
            },
          ],
        },
      },
    });

    const items = res?.data?.items || [];
    records.push(...items);

    pageToken = res?.data?.page_token;
    if (!pageToken) break;
  }

  return records;
}

/**
 * Tạo nhiều bản ghi vào Lark Base bằng batchCreate.
 * Lark giới hạn mỗi request tối đa 500 records, nên hàm này sẽ:
 *  - Tự chia mảng records thành các chunk 500 phần tử
 *  - Gửi tuần tự để tránh lỗi rate limit
 *  - Log tiến độ mỗi batch
 *
 * @async
 * @param {import("@larksuiteoapi/node-sdk").Client} client - Lark OpenAPI client
 * @param {string} baseId - ID của Lark Base
 * @param {string} tableId - ID của table
 * @param {Array<Object>} listField - Danh sách record với cấu trúc { fields: {...} }
 * @returns {Promise<void>}
 */
export async function createLarkRecords(client, baseId, tableId, listField) {
  const chunks = utils.chunkArray(listField, 500);
  let total = 0;

  console.log(
    `Tổng ${listField.length} bản ghi → chia thành ${chunks.length} batch`
  );

  for (let i = 0; i < chunks.length; i++) {
    const batch = chunks[i];
    console.log(
      `Gửi batch [create] ${i + 1}/${chunks.length} (${batch.length} bản ghi)`
    );

    try {
      const res = await client.bitable.appTableRecord.batchCreate({
        path: { app_token: baseId, table_id: tableId },
        params: { ignore_consistency_check: true },
        data: { records: batch },
      });

      if (res?.data?.records?.length) total += res.data.records.length;
      else console.warn(`Batch ${i + 1}: Không tạo được bản ghi nào`);

      await utils.delay(100);
    } catch (err) {
      const errMsg = err.response?.data
        ? JSON.stringify(err.response.data, null, 2)
        : err.message;
      console.error(`Lỗi batch ${i + 1}: ${errMsg}`);
    }
  }

  console.log(
    "SUCCESS:",
    `Tổng cộng đã tạo mới ${total}/${listField.length} bản ghi`
  );
}

/**
 * Cập nhật nhiều bản ghi theo batch (batchUpdate).
 *
 * Tương tự create, Lark giới hạn max 500 records mỗi request nên hàm:
 *  - Chia dữ liệu thành chunk 500 record
 *  - Gửi tuần tự từng batch
 *  - Cho phép ignore_consistency_check để tránh lock conflict
 *
 * Mỗi phần tử trong listField phải có dạng:
 *  {
 *    record_id: "rec_xxx",
 *    fields: { field_1: ..., field_2: ... }
 *  }
 *
 * @async
 * @param {import("@larksuiteoapi/node-sdk").Client} client - Lark OpenAPI client
 * @param {string} baseId - Lark Base ID
 * @param {string} tableId - Table ID
 * @param {Array<Object>} listField - Danh sách bản ghi update
 * @returns {Promise<void>}
 */
export async function updateLarkRecords(client, baseId, tableId, listField) {
  const chunks = utils.chunkArray(listField, 500);
  let total = 0;

  console.log(
    `Tổng ${listField.length} bản ghi cần update → chia thành ${chunks.length} batch`
  );

  for (let i = 0; i < chunks.length; i++) {
    const batch = chunks[i];
    console.log(
      `Gửi batch [update] ${i + 1}/${chunks.length} (${batch.length} bản ghi)`
    );

    try {
      const res = await client.bitable.appTableRecord.batchUpdate({
        path: { app_token: baseId, table_id: tableId },
        params: { ignore_consistency_check: true, user_id_type: "open_id" },
        data: { records: batch },
      });

      if (res?.data?.records?.length) total += res.data.records.length;
      else console.warn(`Batch ${i + 1}: Không có bản ghi nào được cập nhật`);

      await utils.delay(100);
    } catch (err) {
      const errMsg = err.response?.data
        ? JSON.stringify(err.response.data, null, 2)
        : err.message;
      console.error(`Lỗi batch ${i + 1}: ${errMsg}`);
    }
  }

  console.log(
    "SUCCESS:",
    `Tổng cộng đã update ${total}/${listField.length} bản ghi`
  );
}
