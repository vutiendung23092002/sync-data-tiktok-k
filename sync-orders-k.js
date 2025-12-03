import { env } from "./src/config/env.js";
import { createLarkClient } from "./src/core/larkbase-client.js";
import { checkAndRefreshAllTokens } from "./src/services/tiktok/refresh-access-token.js";
import { getTiktokShopInfo } from "./src/services/tiktok/get-all-shop-info.js";
import { getAllOrdersTiktok } from "./src/services/tiktok/get-all-orders.js";
import { getAllCostMap } from "./src/services/kiot/get-all-cost-map.js";
import { syncDataToLarkBaseFilterDate } from "./src/services/larkbase/index.js";
import * as utils from "./src/utils/index.js";

async function syncOrdersTiktok(
  baseId,
  tableOrdersName,
  tableOrderItemsName,
  from,
  to
) {
  console.log(`Đồng bộ đơn hàng từ ngày ${from} đến ${to}`);
  const {
    newMap: newCostMap,
    oldMap: oldCostMap,
    merged: mergedCost,
  } = await getAllCostMap();

  // utils.writeJsonFile("./src/data/cost_map.json", newCostMap);
  // utils.writeJsonFile("./src/data/cost_map_old.json", oldCostMap);
  // utils.writeJsonFile("./src/data/cost_map_merged_sorted.json", mergedCost);

  const access_token_tsp = await checkAndRefreshAllTokens(
    env.TIKTOK.shop_han_korea_7561567100864644872.app_key,
    env.TIKTOK.shop_han_korea_7561567100864644872.app_secret,
    "envCloud", // Tên bảng lưu thông tin token trên supabase
    2
  );

  const shops = await getTiktokShopInfo(
    env.TIKTOK.shop_han_korea_7561567100864644872.app_key,
    env.TIKTOK.shop_han_korea_7561567100864644872.app_secret,
    access_token_tsp
  );

  const orders = await getAllOrdersTiktok(
    env.TIKTOK.shop_han_korea_7561567100864644872.app_key,
    env.TIKTOK.shop_han_korea_7561567100864644872.app_secret,
    access_token_tsp,
    utils.vnTimeToUtcTimestamp(from),
    utils.vnTimeToUtcTimestamp(to),
    shops
  );

  // utils.writeJsonFile("./src/data/all_orders.json", orders);

  const allOrders = orders.map((o) => utils.formatTikTokOrder(o));

  const allOrderItems = orders.flatMap((o) =>
    (o.line_items || []).map((i) =>
      utils.formatTikTokOrderItem(i, o, mergedCost)
    )
  );

  // utils.writeJsonFile("./src/data/all_orders_formatted.json", allOrders);
  // utils.writeJsonFile(
  //   "./src/data/all_order_items_formatted.json",
  //   allOrderItems
  // );

  console.log(
    `Lấy được ${allOrders.length} đơn hàng | ${allOrderItems.length} item đơn hàng!\n`
  );

  const larkOrdersClient = await createLarkClient(
    env.LARK.tiktok_k_orders_items.app_id,
    env.LARK.tiktok_k_orders_items.app_secret
  );

  const ONE_DAY = 24 * 60 * 60 * 1000;
  const timestampFrom = utils.vnTimeToUTCTimestampMiliseconds(from) - ONE_DAY;
  const timestampTo = utils.vnTimeToUTCTimestampMiliseconds(to) + ONE_DAY;

  await syncDataToLarkBaseFilterDate(
    larkOrdersClient,
    baseId,
    {
      tableName: tableOrdersName,
      records: allOrders,
      fieldMap: utils.ORDER_FIELD_MAP,
      typeMap: utils.ORDER_TYPE_MAP,
      uiType: utils.ORDER_UI_TYPE_MAP,
      currencyCode: "VND",
      idLabel: "ID định danh (TTS)",
    },
    "Ngày tạo đơn",
    timestampFrom,
    timestampTo
  );
  //item
  await syncDataToLarkBaseFilterDate(
    larkOrdersClient,
    baseId,
    {
      tableName: tableOrderItemsName,
      records: allOrderItems,
      fieldMap: utils.ORDER_ITEM_FIELD_MAP,
      typeMap: utils.ORDER_ITEM_TYPE_MAP,
      uiType: utils.ORDER_ITEM_UI_TYPE_MAP,
      currencyCode: "VND",
      idLabel: "ID định danh (TTS)",
      excludeUpdateField: "Giá vốn",
    },
    "Ngày tạo đơn",
    timestampFrom,
    timestampTo
  );
}

const baseId = process.env.BASE_ID_TMDT;

const tableOrdersName = process.env.TABLE_ORDERS_NAME;
const tableOrderItemsName = process.env.TABLE_ORDER_ITEMS_NAME;

// input hoặc env đều đã có yyyy/mm/dd
const from = process.env.FROM ? `${process.env.FROM} 00:00:00` : null;

const to = process.env.TO ? `${process.env.TO} 23:59:59` : null;

syncOrdersTiktok(baseId, tableOrdersName, tableOrderItemsName, from, to);
