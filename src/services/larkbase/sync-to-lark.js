// import * as larkbaseService from "./index.js";
// import * as utils from "../../utils/index.js";

// /**
//  * Đồng bộ dữ liệu vào LarkBase có filter theo khoảng ngày
//  */
// export async function syncDataToLarkBaseFilterDate(
//   client,
//   baseId,
//   {
//     tableName,
//     selectFn,
//     records = null,
//     fieldMap,
//     typeMap,
//     uiType,
//     currencyCode = "VND",
//     idLabel = "ID định danh (TTS)",
//     excludeUpdateField = null,
//   },
//   filterFieldName,
//   startDate,
//   endDate
// ) {
//   console.log(`=== Đồng bộ dữ liệu lên LarkBase: ${tableName} ===`);

//   // Lấy dữ liệu nguồn
//   const sourceRecords = records
//     ? records
//     : await selectFn?.(startDate, endDate);

//   const data = sourceRecords || [];
//   console.log(`Tổng số bản ghi cần đồng bộ: ${data.length}`);

//   if (!data.length) {
//     console.warn("Không có dữ liệu để đồng bộ!");
//     return;
//   }

//   // Data cho diff
//   const newDataForDiff = data.map((r) => ({
//     id: String(r.id),
//     hash: r.hash,
//   }));

//   // Kiểm tra bảng
//   const listTb = await larkbaseService.getListTable(client, baseId);
//   const table = listTb?.data?.items?.find((t) => t.name === tableName);
//   let tableId;

//   if (table) {
//     console.log(`[LARK] Bảng '${tableName}' đã tồn tại.`);
//     tableId = table.table_id;
//   } else {
//     console.log(`[LARK] Tạo bảng '${tableName}' mới...`);

//     const fields = Object.entries(fieldMap).map(([key, label]) =>
//       utils.buildField(key, label, typeMap[key], uiType[key], currencyCode)
//     );

//     tableId = await larkbaseService.ensureLarkBaseTable(
//       client, baseId, tableName, fields
//     );
//   }
//   console.log("TABLE_ID:", tableId);

//   // Lấy dữ liệu hiện có từ range filter
//   const existingRecords = await larkbaseService.searchLarkRecordsFilterDate(
//     client,
//     baseId,
//     tableId,
//     1000,
//     filterFieldName,
//     startDate,
//     endDate
//   );

//   console.log(
//     `[LARK] Đã lấy ${existingRecords.length} bản ghi hiện có từ LarkBase.`
//   );

//   const simplifiedRecords = utils
//     .extractLarkIdHash(existingRecords, idLabel)
//     .map((r) => ({
//       ...r,
//       id: String(r.id),
//     }));

//   const { toUpsert } = utils.diffRecords(
//     newDataForDiff,
//     simplifiedRecords,
//     "id",
//     "hash",
//     tableName
//   );

//   const larkIdMap = Object.fromEntries(
//     simplifiedRecords.map((r) => [String(r.id), r.record_id])
//   );

//   // Tạo mới
//   const toCreate = data
//     .filter(
//       (r) =>
//         toUpsert.some((u) => String(u.id) === String(r.id)) &&
//         !larkIdMap[String(r.id)]
//     )
//     .map((r) => utils.mapFieldsToLark(r, fieldMap, typeMap));

//   // Cập nhật (có chặn field)
//   const toUpdate = data
//     .filter(
//       (r) =>
//         toUpsert.some((u) => String(u.id) === String(r.id)) &&
//         larkIdMap[String(r.id)]
//     )
//     .map((r) => {
//       const mapped = utils.mapFieldsToLark(r, fieldMap, typeMap).fields;

//       //  BLOCK FIELD ĐƯỢC KHAI BÁO TẠI OPTIONS
//       if (excludeUpdateField && mapped[excludeUpdateField] !== undefined) {
//         delete mapped[excludeUpdateField];
//       }

//       return {
//         record_id: larkIdMap[String(r.id)],
//         fields: mapped,
//       };
//     });

//   console.log(
//     `[LARK] Tạo mới: ${toCreate.length} | Cập nhật: ${toUpdate.length}`
//   );

//   // Push lên Lark
//   await Promise.all([
//     toCreate.length
//       ? larkbaseService.createLarkRecords(client, baseId, tableId, toCreate)
//       : Promise.resolve(),

//     toUpdate.length
//       ? larkbaseService.updateLarkRecords(client, baseId, tableId, toUpdate)
//       : Promise.resolve(),
//   ]);

//   console.log(`[LARK] Hoàn tất đồng bộ '${tableName}'`);
// }


import * as larkbaseService from "./index.js";
import * as utils from "../../utils/index.js";

/**
 * Đồng bộ dữ liệu vào LarkBase có filter theo khoảng ngày
 */
export async function syncDataToLarkBaseFilterDate(
  client,
  baseId,
  {
    tableName,
    selectFn,
    records = null,
    fieldMap,
    typeMap,
    uiType,
    currencyCode = "VND",
    idLabel = "ID định danh (TTS)",
    excludeUpdateField = null, // string hoặc array
  },
  filterFieldName,
  startDate,
  endDate
) {
  console.log(`=== Đồng bộ dữ liệu lên LarkBase: ${tableName} ===`);

  // Lấy dữ liệu nguồn
  const sourceRecords = records
    ? records
    : await selectFn?.(startDate, endDate);

  const data = sourceRecords || [];
  console.log(`Tổng số bản ghi cần đồng bộ: ${data.length}`);

  if (!data.length) {
    console.warn("Không có dữ liệu để đồng bộ!");
    return;
  }

  // Data cho diff
  const newDataForDiff = data.map((r) => ({
    id: String(r.id),
    hash: r.hash,
  }));

  // Kiểm tra bảng
  const listTb = await larkbaseService.getListTable(client, baseId);
  const table = listTb?.data?.items?.find((t) => t.name === tableName);
  let tableId;

  if (table) {
    console.log(`[LARK] Bảng '${tableName}' đã tồn tại.`);
    tableId = table.table_id;
  } else {
    console.log(`[LARK] Tạo bảng '${tableName}' mới...`);

    const fields = Object.entries(fieldMap).map(([key, label]) =>
      utils.buildField(key, label, typeMap[key], uiType[key], currencyCode)
    );

    tableId = await larkbaseService.ensureLarkBaseTable(
      client,
      baseId,
      tableName,
      fields
    );
  }
  console.log("TABLE_ID:", tableId);

  // Lấy dữ liệu hiện có từ range filter
  const existingRecords = await larkbaseService.searchLarkRecordsFilterDate(
    client,
    baseId,
    tableId,
    1000,
    filterFieldName,
    startDate,
    endDate
  );

  console.log(
    `[LARK] Đã lấy ${existingRecords.length} bản ghi hiện có từ LarkBase.`
  );

  const simplifiedRecords = utils
    .extractLarkIdHash(existingRecords, idLabel)
    .map((r) => ({
      ...r,
      id: String(r.id),
    }));

  const { toUpsert } = utils.diffRecords(
    newDataForDiff,
    simplifiedRecords,
    "id",
    "hash",
    tableName
  );

  const larkIdMap = Object.fromEntries(
    simplifiedRecords.map((r) => [String(r.id), r.record_id])
  );

  // Tạo mới
  const toCreate = data
    .filter(
      (r) =>
        toUpsert.some((u) => String(u.id) === String(r.id)) &&
        !larkIdMap[String(r.id)]
    )
    .map((r) => utils.mapFieldsToLark(r, fieldMap, typeMap));

  // ===========================
  // UPDATE — có exclude field
  // ===========================
  const toUpdate = data
    .filter(
      (r) =>
        toUpsert.some((u) => String(u.id) === String(r.id)) &&
        larkIdMap[String(r.id)]
    )
    .map((r) => {
      const mapped = utils.mapFieldsToLark(r, fieldMap, typeMap).fields;

      const excludeList = Array.isArray(excludeUpdateField)
        ? excludeUpdateField
        : excludeUpdateField
        ? [excludeUpdateField]
        : [];

      if (excludeList.length > 0) {
        const oldRecordFull = existingRecords.find(
          (rec) => rec.record_id === larkIdMap[String(r.id)]
        );

        excludeList.forEach((fldLabel) => {
          const oldVal = oldRecordFull?.fields?.[fldLabel];

          const hasOldValue =
            oldVal !== undefined &&
            oldVal !== null &&
            oldVal !== "" &&
            !(Array.isArray(oldVal) && oldVal.length === 0);

          // Nếu có dữ liệu cũ → không update field này
          if (hasOldValue && mapped[fldLabel] !== undefined) {
            delete mapped[fldLabel];
          }
        });
      }

      return {
        record_id: larkIdMap[String(r.id)],
        fields: mapped,
      };
    });

  console.log(
    `[LARK] Tạo mới: ${toCreate.length} | Cập nhật: ${toUpdate.length}`
  );

  // Push lên Lark
  await Promise.all([
    toCreate.length
      ? larkbaseService.createLarkRecords(client, baseId, tableId, toCreate)
      : Promise.resolve(),

    toUpdate.length
      ? larkbaseService.updateLarkRecords(client, baseId, tableId, toUpdate)
      : Promise.resolve(),
  ]);

  console.log(`[LARK] Hoàn tất đồng bộ '${tableName}'`);
}
