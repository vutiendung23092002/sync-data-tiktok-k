import {
  getStatements,
  getTransactionByStatement,
} from "../../core/tiktok-api.js";
import { API_PATHS_TIKTOK } from "../../config/constants.js";
import * as utils from "../../utils/index.js";

export async function getAllStatement(
  appKey,
  appSecret,
  accessToken,
  from,
  to,
  shops
) {
  let allStatements = [];
  let nextPageToken = null;
  const path = API_PATHS_TIKTOK.TIKTOK_FINANCE_STATEMENT;

  for (const shop of shops) {
    do {
      const timestamp = Math.floor(Date.now() / 1000);

      const params = {
        app_key: appKey,
        timestamp,
        page_size: 100,
        sort_order: "DESC",
        sort_field: "statement_time",
        shop_cipher: shop.cipher,
        statement_time_ge: from,
        statement_time_lt: to,
      };

      if (nextPageToken) params.page_token = nextPageToken;

      const headers = {
        "x-tts-access-token": accessToken,
      };

      const sign = utils.generateTikTokSignSmart({
        appSecret,
        path,
        params,
        method: "GET",
      });

      if (sign) params.sign = sign;

      const res = await getStatements(path, params, headers);
      nextPageToken = res?.data?.next_page_token || null;

      const statements = res?.data?.statements || [];
      allStatements.push(...statements);
    } while (nextPageToken);
  }

  return allStatements;
}

export async function getAllTransactionsByStatement(
  appKey,
  appSecret,
  accessToken,
  shops,
  statements = [],
  from,
  to
) {
  if (!Array.isArray(statements) || statements.length === 0) {
    console.warn("statement list rỗng hoặc không hợp lệ!");
    return [];
  }
  let transactions = [];

  for (const shop of shops) {
    const results = [];
    for (const st of statements) {
      const timestamp = Math.floor(Date.now() / 1000);
      const statementId = st.id;
      const path =
        API_PATHS_TIKTOK.TIKTOK_FINANCE_TRANSACTION_BY_STATEMENT.replace(
          "{statement_id}",
          statementId
        );
      const statementTime = st.statement_time;
      let nextPageToken = null;
      do {
        const params = {
          app_key: appKey,
          timestamp,
          page_size: 100,
          sort_order: "DESC",
          sort_field: "order_create_time",
          shop_cipher: shop.cipher,
        };

        if (nextPageToken) params.page_token = nextPageToken;

        const sign = utils.generateTikTokSignSmart({
          appSecret,
          path,
          params,
          method: "GET",
        });

        if (sign) params.sign = sign;

        const headers = {
          "x-tts-access-token": accessToken,
        };

        const res = await utils.callWithRetry(
          () => getTransactionByStatement(path, params, headers),
          10,
          1000
        );

        nextPageToken = res?.data?.next_page_token || null;

        results.push({
          statementId,
          statementTime,
          ...res?.data,
        });
      } while (nextPageToken);
    }

    for (const r of results) {
      if (r?.transactions?.length) {
        const withStatement = r.transactions.map((t) => ({
          ...t,
          statement_id: r.statementId,
          statement_time: r.statementTime,
          shop_id: shop.id,
          shop_name: shop.name,
        }));

        transactions.push(...withStatement);
      }
    }
  }

  const filteredTransactions = transactions.filter((item) => {
    const orderTs = Number(item.statement_time);
    return orderTs >= from && orderTs <= to;
  });

  return filteredTransactions;
}
