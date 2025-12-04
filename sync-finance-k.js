import { env } from "./src/config/env.js";
import { createLarkClient } from "./src/core/larkbase-client.js";
import { checkAndRefreshAllTokens } from "./src/services/tiktok/refresh-access-token.js";
import { getTiktokShopInfo } from "./src/services/tiktok/get-all-shop-info.js";
import {
  getAllStatement,
  getAllTransactionsByStatement,
} from "./src/services/tiktok/get-all-statements.js";
import { syncDataToLarkBaseFilterDate } from "./src/services/larkbase/index.js";
import * as utils from "./src/utils/index.js";

async function syncFinanceTiktok(baseId, tableFinanceName, from, to) {
  console.log(`Đồng bộ tài chính từ ngày ${from} đến ${to}`);
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

  const ONE_DAY = 24 * 60 * 60 * 1000;

  const statements = await getAllStatement(
    env.TIKTOK.shop_han_korea_7561567100864644872.app_key,
    env.TIKTOK.shop_han_korea_7561567100864644872.app_secret,
    access_token_tsp,
    utils.vnTimeToUtcTimestamp(from) - 24 * 60 * 60,
    utils.vnTimeToUtcTimestamp(to) + 24 * 60 * 60,
    shops
  );

  console.log(statements.length);

  utils.writeJsonFile("./src/data/all_statements.json", statements);

  const transactions = await getAllTransactionsByStatement(
    env.TIKTOK.shop_han_korea_7561567100864644872.app_key,
    env.TIKTOK.shop_han_korea_7561567100864644872.app_secret,
    access_token_tsp,
    shops,
    statements,
    utils.vnTimeToUtcTimestamp(from),
    utils.vnTimeToUtcTimestamp(to)
  );

  console.log(transactions.length);

  utils.writeJsonFile(
    "./src/data/all_transactions_statements.json",
    transactions
  );

  const txFormated = transactions.map((tx) =>
    utils.formatTikTokTransactionFull(tx)
  );

  utils.writeJsonFile("./src/data/all_transactions_formatted.json", txFormated);

  const larkFinanceClient = await createLarkClient(
    env.LARK.tiktok_k_orders_items.app_id,
    env.LARK.tiktok_k_orders_items.app_secret
  );

  const timestampFrom = utils.vnTimeToUTCTimestampMiliseconds(from) - ONE_DAY;
  const timestampTo = utils.vnTimeToUTCTimestampMiliseconds(to) + ONE_DAY;

  await syncDataToLarkBaseFilterDate(
    larkFinanceClient,
    baseId,
    {
      tableName: "tetsFinance",
      records: txFormated,
      fieldMap: utils.TRANSACTION_FIELD_MAP,
      typeMap: utils.TRANSACTION_TYPE_MAP,
      uiType: utils.TRANSACTION_UI_TYPE_MAP,
      currencyCode: "VND",
      idLabel: "ID định danh (TTS)",
    },
    "Ngày quyết toán",
    timestampFrom,
    timestampTo
  );
}

const baseId = process.env.BASE_ID_TMDT;

const tableFinanceName = process.env.TABLE_NAME;

// input hoặc env đều đã có yyyy/mm/dd
const from = process.env.FROM ? `${process.env.FROM} 00:00:00` : null;

const to = process.env.TO ? `${process.env.TO} 23:59:59` : null;

syncFinanceTiktok(baseId, tableFinanceName, from, to);
