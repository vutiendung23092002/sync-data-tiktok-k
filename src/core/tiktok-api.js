import http from "./http-client.js";
import {
  TIKTOK_AUTH_URL,
  TIKTOK_BASE_URL,
  API_PATHS,
} from "../config/constants.js";
import { generateTikTokSignSmart } from "../utils/tiktok/generate-sign.js";

/**
 * Lấy access_token TikTok Shop bằng auth_code (bước cuối OAuth).
 * @param { JSON } params 
 * {
      app_key:  Authorization code trả về từ TikTok OAuth,
      app_secret: App Key TikTok Shop.,
      auth_code: App Secret TikTok Shop.,
      grant_type: "authorized_code",
    };
 * @returns {Promise<Object>} Dữ liệu token: access_token, refresh_token, expiry,...
 */
export async function getTikTokAccessToken(params) {
  const res = await http.get(API_PATHS.TIKTOK_GET_TOKEN, {
    baseURL: TIKTOK_AUTH_URL,
    params,
  });

  return res;
}

/**
 * Làm mới access_token TikTok Shop bằng refresh_token.
 * @param {JSON} params = {
    app_key: App Key TikTok Shop.,
    app_secret: App Secret TikTok Shop,
    refresh_token: Refresh token hiện tại,
    grant_type: "refresh_token",
  };
 * @returns {Promise<Object>} Token mới.
 */
export async function refreshTikTokAccessToken(params) {
  const res = await http.get(API_PATHS.TIKTOK_REFRESH_TOKEN, {
    baseURL: TIKTOK_AUTH_URL,
    params,
  });

  return res;
}

/**
 * Lấy danh sách shop mà app đang được uỷ quyền (TikTok Partner API).
 * @param {string} appSecret - App Secret TikTok.
 * @param {JSON} params = {
    app_key: App Key TikTok,
    timestamp, - Thời điểm hiện tại curent time
  };
 * @param {JSON} headers = {
    "x-tts-access-token": x-tts-access-token của shop,
  };
 * @returns {Promise<Object>} Danh sách shop: id, cipher, name,...
 */
export async function getAuthorizedShops(headers, params, path) {
  const res = await http.get(path, {
    baseURL: TIKTOK_BASE_URL,
    headers,
    params,
  });

  return res;
}

/**
 * Tìm kiếm danh sách đơn hàng (order/search).
 *
 * @param {string} accessToken - Token truy cập shop.
 * @param {string} appKey - App Key TikTok.
 * @param {string} appSecret - App Secret TikTok.
 * @param {number} pageSize - Số bản ghi mỗi trang.
 * @param {string} sortOrder - ASC hoặc DESC.
 * @param {string|null} pageToken - Page token để load trang tiếp theo.
 * @param {string} sortField - Trường sắp xếp (vd: create_time).
 * @param {string} shopCipher - Mã cipher của shop.
 * @param {number} createTimeGe - Timestamp >=.
 * @param {number} createTimeLt - Timestamp <.
 * @returns {Promise<Object>} Danh sách đơn hàng.
 * @throws {Error} Nếu API trả lỗi.
 */
export async function getOrdersList(
  accessToken,
  appKey,
  appSecret,
  pageSize,
  sortOrder,
  pageToken,
  sortField,
  shopCipher,
  createTimeGe,
  createTimeLt
) {
  const timestamp = Math.floor(Date.now() / 1000);
  const path = API_PATHS.TIKTOK_ORDER_SEARCH;
  const params = {
    app_key: appKey,
    timestamp,
    page_size: pageSize,
    sort_order: sortOrder,
    sort_field: sortField,
    shop_cipher: shopCipher,
  };

  if (pageToken) params.page_token = pageToken;

  const body = {
    create_time_ge: createTimeGe,
    create_time_lt: createTimeLt,
  };

  const sign = generateTikTokSignSmart({
    appSecret,
    path,
    params,
    body,
    method: "POST",
  });

  const res = await http.post(path, body, {
    baseURL: TIKTOK_BASE_URL,
    headers: {
      "x-tts-access-token": accessToken,
      "Content-Type": "application/json",
    },
    params: { ...params, sign },
  });

  if (!res || res.code !== 0) {
    const msg = res?.message || "Unknown TikTok API error";
    console.error(`Lỗi khi gọi orders/search: ${msg}`);
    console.log("TikTok response:", JSON.stringify(res, null, 2));
    throw new Error(`Lỗi khi lấy danh sách đơn hàng: ${msg}`);
  }

  return res;
}

/**
 * Lấy danh sách bảng kê (statements) của shop.
 *
 * @param {string} accessToken - Token truy cập shop.
 * @param {string} appKey - App Key.
 * @param {string} appSecret - Secret Key.
 * @param {number} pageSize - Số record mỗi trang.
 * @param {string} sortOrder - ASC / DESC.
 * @param {string|null} pageToken - Page token.
 * @param {string} sortField - Trường sắp xếp (statement_time,...)
 * @param {string} shopCipher - Mã shop.
 * @param {number} statementTimeGe - Timestamp >=.
 * @param {number} statementTimeLt - Timestamp <.
 * @returns {Promise<Object>} Danh sách statement.
 */
export async function getStatements(
  accessToken,
  appKey,
  appSecret,
  pageSize,
  sortOrder,
  pageToken,
  sortField,
  shopCipher,
  statementTimeGe,
  statementTimeLt
) {
  const timestamp = Math.floor(Date.now() / 1000);
  const path = API_PATHS.TIKTOK_FINANCE_STATEMENT;
  const params = {
    app_key: appKey,
    timestamp,
    page_size: pageSize,
    sort_order: sortOrder,
    sort_field: sortField,
    shop_cipher: shopCipher,
    statement_time_ge: statementTimeGe,
    statement_time_lt: statementTimeLt,
  };

  if (pageToken) params.page_token = pageToken;

  const sign = generateTikTokSignSmart({
    appSecret,
    path,
    params,
    method: "GET",
  });

  const res = await http.get(path, {
    baseURL: TIKTOK_BASE_URL,
    headers: { "x-tts-access-token": accessToken },
    params: { ...params, sign },
  });

  return res;
}

/**
 * Lấy danh sách giao dịch thuộc một statement.
 *
 * @param {string} accessToken - Token truy cập shop.
 * @param {string} appKey - App Key.
 * @param {string} appSecret - Secret Key.
 * @param {number} pageSize - Số record mỗi trang.
 * @param {string} sortOrder - Sắp xếp.
 * @param {string|null} pageToken - Trang tiếp theo.
 * @param {string} sortField - Trường sắp xếp.
 * @param {string} shopCipher - Mã shop.
 * @param {string} statementId - ID bảng kê.
 * @returns {Promise<Object>} Transaction listing.
 */
export async function getTransactionByStatement(
  accessToken,
  appKey,
  appSecret,
  pageSize,
  sortOrder,
  pageToken,
  sortField,
  shopCipher,
  statementId
) {
  const timestamp = Math.floor(Date.now() / 1000);
  const path = API_PATHS.TIKTOK_FINANCE_TRANSACTION_BY_STATEMENT.replace(
    "{statement_id}",
    statementId
  );

  const params = {
    app_key: appKey,
    timestamp,
    page_size: pageSize,
    sort_order: sortOrder,
    sort_field: sortField,
    shop_cipher: shopCipher,
  };

  if (pageToken) params.page_token = pageToken;

  const sign = generateTikTokSignSmart({
    appSecret,
    path,
    params,
    method: "GET",
  });

  const res = await http.get(path, {
    baseURL: TIKTOK_BASE_URL,
    headers: { "x-tts-access-token": accessToken },
    params: { ...params, sign },
  });

  return res;
}

/**
 * Lấy giao dịch tài chính theo order_id (chỉ 1 đơn).
 *
 * @param {string} accessToken
 * @param {string} appKey
 * @param {string} appSecret
 * @param {string} shopCipher
 * @param {string} orderId
 * @returns {Promise<Object>} Danh sách transaction của đơn hàng.
 */
export async function getTransactionByOrder(
  accessToken,
  appKey,
  appSecret,
  shopCipher,
  orderId
) {
  const timestamp = Math.floor(Date.now() / 1000);
  const path = API_PATHS.TIKTOK_FINANCE_TRANSACTION_BY_ORDER.replace(
    "{order_id}",
    orderId
  );

  const params = {
    app_key: appKey,
    timestamp,
    shop_cipher: shopCipher,
  };

  const sign = generateTikTokSignSmart({
    appSecret,
    path,
    params,
    method: "GET",
  });

  const res = await http.get(path, {
    baseURL: TIKTOK_BASE_URL,
    headers: { "x-tts-access-token": accessToken },
    params: { ...params, sign },
  });

  return res;
}

/**
 * Tìm kiếm danh sách yêu cầu trả hàng / hoàn tiền.
 *
 * @param {string} accessToken - Token truy cập shop.
 * @param {string} appKey - App Key.
 * @param {string} appSecret - Secret Key.
 * @param {string} sortField - Trường sắp xếp. mặc định: create_time
 * @param {string} sortOrder - ASC/DESC. Mặc định: ASC
 * @param {number} pageSize - Số bản ghi mỗi trang.
 * @param {string|null} pageToken - Page token nếu có.
 * @param {string} shopCipher - Mã shop.
 * @param {number} createTimeGe - Timestamp >=.
 * @param {number} createTimeLt - Timestamp <.
 * @returns {Promise<Object>} Danh sách yêu cầu trả hàng.
 */
export async function searchReturns(
  accessToken,
  appKey,
  appSecret,
  sortField,
  sortOrder,
  pageSize,
  pageToken,
  shopCipher,
  createTimeGe,
  createTimeLt
) {
  const timestamp = Math.floor(Date.now() / 1000);
  const path = API_PATHS.TIKTOK_SEARCH_RETURNS_REFUND;

  const params = {
    app_key: appKey,
    timestamp,
    page_size: pageSize,
    sort_order: sortOrder,
    sort_field: sortField,
    shop_cipher: shopCipher,
  };

  if (pageToken) params.page_token = pageToken;

  const body = {
    create_time_ge: createTimeGe,
    create_time_lt: createTimeLt,
  };

  const sign = generateTikTokSignSmart({
    appSecret,
    path,
    params,
    body,
    method: "POST",
  });

  const res = await http.post(path, body, {
    baseURL: TIKTOK_BASE_URL,
    headers: {
      "x-tts-access-token": accessToken,
      "Content-Type": "application/json",
    },
    params: { ...params, sign },
  });

  console.log(res);

  return res;
}
