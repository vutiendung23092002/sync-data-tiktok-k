import axios from "axios";

/**
 * HTTP client dùng chung cho toàn bộ hệ thống:
 * - TikTok Shop Partner API
 * - TikTok Ads API
 * - Lark Base API
 * - Supabase REST API
 * - Bất kỳ service nào cần HTTP request
 *
 * Được build trên axios, có sẵn:
 * - Timeout 30 giây
 * - Header mặc định: Content-Type: application/json
 * - Request interceptor: log method + URL
 * - Response interceptor: log status, trả về response.data
 * - Error interceptor: log lỗi theo format TikTok, throw về lỗi gốc
 *
 * Cách dùng:
 *   http.get("/order/202309/orders/search", {
 *       baseURL: TIKTOK_BASE_URL,
 *       params: {...}
 *   });
 *
 *   http.post("/bitable/v1/apps/:base_id/tables/:table_id/records", {
 *       baseURL: LARK_API_BASE,
 *       data: {...}
 *   });
 *
 * @type {import("axios").AxiosInstance}
 */
const http = axios.create({
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ======================= REQUEST INTERCEPTOR =======================
/**
 * Interceptor xử lý trước khi gửi request:
 * - Log method + URL đã build
 * - Cho phép override baseURL theo từng API
 *
 * @param {import("axios").AxiosRequestConfig} config
 * @returns {import("axios").AxiosRequestConfig}
 */
http.interceptors.request.use((config) => {
  const base = config.baseURL ? config.baseURL : "";
  console.log(`[${config.method.toUpperCase()}] ${base}${config.url}`);
  return config;
});

// ======================= RESPONSE INTERCEPTOR =======================
/**
 * Interceptor xử lý sau khi nhận response thành công:
 * - Log status code
 * - Trả về response.data (thay vì full axios response)
 *
 * @param {import("axios").AxiosResponse} response
 * @returns {any} response.data
 */
http.interceptors.response.use(
  (response) => {
    console.log(`[${response.status}] ${response.config.url}`);
    return response.data;
  },

  /**
   * Interceptor xử lý lỗi:
   * - Log status, mã lỗi, message theo format TikTok API
   * - Log thêm JSON trả về nếu có
   * - Throw error.response.data nếu tồn tại, fallback về error gốc
   *
   * @param {import("axios").AxiosError} error
   * @throws {any}
   */
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    const code = error.response?.data?.code;

    console.error(
      `[${status || "ERR"}] ${
        error.config?.url
      }\n→ API Error [${code}]: ${message}`
    );

    if (error.response?.data) {
      console.log("Response:", JSON.stringify(error.response.data, null, 2));
    }

    // QUAN TRỌNG: Throw nguyên error, không bóc tách
    throw error;
  }
);

export default http;
