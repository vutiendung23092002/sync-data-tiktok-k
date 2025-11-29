import crypto from "crypto";

/**
 * generateTikTokSignSmart
 * Tự động sinh sign theo quy tắc TikTok OpenAPI:
 * - GET → không include body
 * - POST (JSON) → include JSON.stringify(body), kể cả rỗng {}
 * - multipart/form-data → bỏ body khỏi chuỗi ký
 *
 * @param {Object} options
 * @param {string} options.appSecret - Secret key của app TikTok
 * @param {string} options.path - Endpoint path (VD: '/order/202309/orders/search')
 * @param {Object} [options.params] - Các query param cần ký
 * @param {any} [options.body] - Body (nếu là POST)
 * @param {string} [options.contentType='application/json']
 * @param {"GET"|"POST"|"PUT"|"DELETE"} [options.method='GET']
 * @returns {string} - Signature TikTok (hex lowercase)
 */
export function generateTikTokSignSmart({
    appSecret,
    path,
    params = {},
    body = null,
    contentType = "application/json",
    method = "GET",
}) {
    if (!appSecret || !path) {
        throw new Error("appSecret và path là bắt buộc");
    }

    // Bỏ qua một số key không cần ký
    const excludeKeys = new Set(["sign", "access_token"]);

    const validKeys = Object.keys(params)
        .filter(
            (k) =>
                !excludeKeys.has(k) &&
                params[k] !== "" &&
                params[k] !== null &&
                params[k] !== undefined
        )
        .sort();

    // B1: nối key + value
    const paramStr = validKeys.map((k) => `${k}${params[k]}`).join("");

    // B2: nối path + params
    let strToSign = path + paramStr;

    // B3: nếu là POST và không phải multipart → thêm body (kể cả rỗng)
    if (
        method !== "GET" &&
        contentType !== "multipart/form-data" &&
        body !== null
    ) {
        strToSign += JSON.stringify(body);
    }

    // B4: bọc secret trước & sau
    const finalStr = `${appSecret}${strToSign}${appSecret}`;

    // B5: HMAC-SHA256 -> hex lowercase
    const sign = crypto
        .createHmac("sha256", appSecret)
        .update(finalStr)
        .digest("hex");

    return sign;
}
