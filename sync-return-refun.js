import { env } from "./src/config/env.js";
import { createLarkClient } from "./src/core/larkbase-client.js";
import { checkAndRefreshAllTokens } from "./src/services/tiktok/refresh-access-token.js";
import { getTiktokShopInfo } from "./src/services/tiktok/get-all-shop-info.js";
import { getAllOrdersReturn } from "./src/services/tiktok/get-all-return-orders.js";
import * as utils from "./src/utils/index.js";

async function syncReturnRefunTiktok(baseId, tableReturnRefun, from, to) {
  console.log(`Đồng bộ đơn hàng hoàn trả từ ngày ${from} đến ${to}`);
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

  const returnOrders = await getAllOrdersReturn(
    env.TIKTOK.shop_han_korea_7561567100864644872.app_key,
    env.TIKTOK.shop_han_korea_7561567100864644872.app_secret,
    access_token_tsp,
    utils.vnTimeToUtcTimestamp(from),
    utils.vnTimeToUtcTimestamp(to),
    shops
  );

  const returnOrderFormated = returnOrders.map((tx) =>
    utils.formatTikTokReturnOrder(tx)
  );

  const larkFinanceClient = await createLarkClient(
    env.LARK.tiktok_k_orders_items.app_id,
    env.LARK.tiktok_k_orders_items.app_secret
  );

  const ONE_DAY = 24 * 60 * 60 * 1000; // ms
  const timestampFrom = utils.vnTimeToUTCTimestampMiliseconds(from) - ONE_DAY;
  const timestampTo = utils.vnTimeToUTCTimestampMiliseconds(to) + ONE_DAY;

  await syncDataToLarkBaseFilterDate(
    larkFinanceClient,
    baseId,
    {
      tableName: tableReturnRefun,
      records: returnOrderFormated,
      fieldMap: utils.RETURN_ORDER_FIELD_MAP,
      typeMap: utils.RETURN_ORDER_TYPE_MAP,
      uiType: utils.RETURN_ORDER_UI_TYPE_MAP,
      currencyCode: "VND",
      idLabel: "ID định danh (TTS)",
    },
    "Ngày tạo",
    timestampFrom,
    timestampTo
  );
}

const baseId = process.env.BASE_ID_TMDT;

const tableReturnRefun = process.env.TABLE_NAME;

// input hoặc env đều đã có yyyy/mm/dd
const from = process.env.FROM ? `${process.env.FROM} 00:00:00` : null;

const to = process.env.TO ? `${process.env.TO} 23:59:59` : null;
syncReturnRefunTiktok(baseId, tableReturnRefun, from, to);
