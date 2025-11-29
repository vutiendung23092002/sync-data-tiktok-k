/**
 * URL dùng cho quy trình OAuth của TikTok Shop (Partner API).
 * Dùng để lấy token, refresh token, uỷ quyền shop.
 * @type {string}
 */
export const TIKTOK_AUTH_URL = "https://auth.tiktok-shops.com";

/**
 * Base URL cho TikTok Shop Partner API toàn cầu.
 * Tất cả request chính của Partner API sẽ dùng base này.
 * @type {string}
 */
export const TIKTOK_BASE_URL = "https://open-api.tiktokglobalshop.com";

/**
 * Base URL cho TikTok Business/Ads API.
 * Dùng để lấy quảng cáo, business center, báo cáo GMV Max...
 * @type {string}
 */
export const TIKTOK_ADS_BASE_URL =
  "https://business-api.tiktok.com/open_api/v1.3";

/**
 * Tập hợp các endpoint của TikTok Shop Partner API và TikTok Ads API.
 * Dùng để xây URL request bằng cách nối với BASE_URL tương ứng.
 *
 * @type {Object.<string, string>}
 */
export const API_PATHS = {
  // Partner API (Shop)

  /** Lấy access_token từ auth code */
  TIKTOK_GET_TOKEN: "/api/v2/token/get",

  /** Refresh access_token bằng refresh_token */
  TIKTOK_REFRESH_TOKEN: "/api/v2/token/refresh",

  /** Lấy danh sách shop đã được uỷ quyền */
  TIKTOK_GET_SHOP: "/authorization/202309/shops",

  /** Tìm kiếm sản phẩm theo shop */
  TIKTOK_SEARCH_PRODUCTS: "/product/202502/products/search",

  /** Tìm kiếm sản phẩm global (cross-border) */
  TIKTOK_SEARCH_GLOBAL_PRODUCTS: "/product/202309/global_products/search",

  /** Lấy thông tin sản phẩm theo product_id */
  TIKTOK_GET_PRODUCT: "/product/202309/products/{product_id}",

  /** Tìm kiếm đơn hàng */
  TIKTOK_ORDER_SEARCH: "/order/202309/orders/search",

  /** Lấy danh sách bảng kê (statements) */
  TIKTOK_FINANCE_STATEMENT: "/finance/202309/statements",

  /** Lấy giao dịch theo statement_id */
  TIKTOK_FINANCE_TRANSACTION_BY_STATEMENT:
    "/finance/202501/statements/{statement_id}/statement_transactions",

  /** Lấy giao dịch theo order_id */
  TIKTOK_FINANCE_TRANSACTION_BY_ORDER:
    "/finance/202309/orders/{order_id}/statement_transactions",

  /** Tìm kiếm yêu cầu trả hàng/hoàn tiền */
  TIKTOK_SEARCH_RETURNS_REFUND: "/return_refund/202309/returns/search",

  // Ads API

  /** Lấy danh sách business center */
  TIKTOK_ADS_GET_BUSINESS_CENTER: "/bc/get/",

  /** Lấy giao dịch của tài khoản BC */
  TIKTOK_ADS_GET_BC_ACCOUNT_TRANSACTION: "/bc/account/transaction/get/",

  /** Lấy Ads access_token */
  TIKTOK_ADS_GET_ACCESS_TOKEN: "/oauth2/access_token/",

  /** Lấy danh sách tài khoản quảng cáo */
  TIKTOK_ADS_GET_AD_ACCOUNTS: "/oauth2/advertiser/get/",

  /** Lấy danh sách store_id của GMV Max */
  TIKTOK_ADS_GET_GMV_STORE_ID: "/gmv_max/store/list/",

  /** Lấy danh sách chiến dịch GMV Max */
  TIKTOK_ADS_GET_GMV_MAX_CAMPAIGNS: "/gmv_max/campaign/get/",

  /** Chi tiết một chiến dịch GMV Max */
  TIkTOK_ADS_GET_DETAILS_OF_GMV_MAX_CAMPAIGN: "/campaign/gmv_max/info/",

  /** Lấy báo cáo GMV Max */
  TIKTOK_ADS_GET_GMV_MAX_REPORT: "/gmv_max/report/get/",
};
