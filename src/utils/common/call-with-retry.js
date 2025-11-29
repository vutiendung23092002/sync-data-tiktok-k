/**
 * Gọi một hàm async kèm cơ chế retry khi gặp rate limit (mã lỗi 40100).
 *
 * Cách hoạt động:
 *  - Thử gọi `fn()` tối đa `retries` lần.
 *  - Nếu lỗi trả về có code 40100 (TikTok Ads rate limit),
 *    thì chờ `delay` ms rồi thử lại.
 *  - Nếu lỗi khác 40100, văng lỗi ngay lập tức.
 *  - Nếu thử hết số lần retry mà vẫn fail thì ném error.
 *
 * @async
 * @function callWithRetry
 *
 * @param {Function} fn - Hàm async cần gọi (thường là API call).
 *                        Phải là hàm return Promise.
 * @param {number} [retries=5] - Số lần retry tối đa.
 * @param {number} [delay=1500] - Thời gian đợi giữa mỗi lần retry (ms).
 *
 * @returns {Promise<*>} Kết quả trả về từ `fn()` nếu thành công.
 *
 * @throws {Error} Nếu retry hết số lần mà vẫn thất bại.
 *
 * @example
 * const result = await callWithRetry(() =>
 *   tiktokAdsApi.getMetrics(accessToken, params)
 * );
 *
 * @example
 * // Tăng số lần retry
 * await callWithRetry(fetchSomething, 10, 2000);
 */
export async function callWithRetry(fn, retries = 5, delay = 1500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const kiotErrorCode = err?.response?.data?.responseStatus?.errorCode;
      const httpStatus = err?.response?.status;

      const isRateLimit = httpStatus === 429 || kiotErrorCode === "RateLimited";

      const isNetworkError =
        err.code === "ECONNRESET" ||
        err.code === "ETIMEDOUT" ||
        err.message?.includes("socket hang up");

      if (isRateLimit || isNetworkError) {
        console.log(
          `⏳ Retry vì ${
            isRateLimit ? "Rate Limit" : "Network Error"
          } - nghỉ ${delay}ms (lần ${attempt}/${retries})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw err; // lỗi khác thì bắn luôn
      }
    }
  }

  throw new Error("❌ Retry quá số lần cho phép");
}
