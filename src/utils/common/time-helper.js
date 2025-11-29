/**
 * Chuyển thời gian Việt Nam (local time) sang timestamp UTC tính bằng giây.
 *
 * Cách hoạt động:
 * - Input phải là chuỗi theo định dạng "YYYY/MM/DD HH:mm:ss".
 * - Hàm sẽ thay "/" bằng "-" để tránh lỗi parse trên một số môi trường.
 * - new Date() mặc định hiểu input là LOCAL TIME (giờ VN nếu đang chạy ở VN).
 * - Trả về timestamp UTC (unix time) tính bằng GIÂY.
 *
 * Lưu ý:
 * - Hàm này KHÔNG bù offset thủ công, vì JS tự xử lý timezone khi parse.
 * - Dùng khi gọi TikTok Shop API vì API dùng timestamp = giây.
 *
 * @function vnTimeToUTCTimestampRaw
 * @param {string} datetimeStr - Chuỗi ngày giờ dạng "YYYY/MM/DD HH:mm:ss".
 * @returns {number} Unix timestamp UTC tính bằng giây.
 *
 * @example
 * vnTimeToUTCTimestampRaw("2025/01/20 15:30:00");
 * // → 1737377400 (ví dụ)
 */
export function vnTimeToUTCTimestampRaw(datetimeStr) {
  const normalized = datetimeStr.replace(/\//g, "-");
  const dateVN = new Date(normalized);
  return Math.floor(dateVN.getTime() / 1000);
}

/**
 * Chuyển ngày giờ Việt Nam sang Unix timestamp (UTC) tính bằng milliseconds.
 *
 * Công dụng:
 * - Khi làm việc với Lark Base, tất cả timestamp đều đang lưu dạng **milliseconds**.
 * - Khi filter record theo range, bạn **bắt buộc** convert string date → timestamp ms.
 *
 * Cách thực hiện:
 * - Convert "YYYY/MM/DD HH:mm:ss" → ISO dạng "YYYY-MM-DDTHH:mm:ss+00:00".
 * - new Date(iso) sẽ hiểu chính xác timezone UTC thay vì timezone máy.
 *
 * @function vnTimeToUTCTimestampMiliseconds
 * @param {string} datetimeStr - Chuỗi ngày giờ dạng "YYYY/MM/DD HH:mm:ss".
 * @returns {number} Unix timestamp UTC tính bằng milliseconds.
 *
 * @example
 * vnTimeToUTCTimestampMiliseconds("2025/01/20 00:00:00");
 * // → 1737331200000
 */
export function vnTimeToUTCTimestampMiliseconds(datetimeStr) {
  const iso = datetimeStr.replace(/\//g, "-").replace(" ", "T") + "+00:00";
  return new Date(iso).getTime();
}

/**
 * Chuyển timestamp UTC (giây) sang ngày giờ Việt Nam,
 * format "YYYY/MM/DD HH:mm:ss".
 *
 * Giải thích cách xử lý:
 * - Input là timestamp theo giây (UNIX time).
 * - new Date(ts * 1000) tạo thời gian gốc UTC.
 * - Bù +7 giờ thủ công để thành giờ Việt Nam (UTC+7).
 * - Không phụ thuộc timezone của runtime (an toàn khi chạy trên server quốc tế).
 *
 * @function utcToVNTime
 * @param {number} utcTimestamp - Timestamp UTC tính bằng giây.
 * @returns {string|null} Chuỗi thời gian theo giờ Việt Nam hoặc null nếu input không hợp lệ.
 *
 * @example
 * utcToVNTime(1737377400);
 * // → "2025/01/20 22:30:00"
 */
export function utcToVNTime(utcTimestamp) {
  if (!utcTimestamp) return null;

  // Nhân 1000 vì JS Date nhận milliseconds
  const dateUTC = new Date(utcTimestamp * 1000);

  // Tính thời gian Việt Nam = UTC + 7 tiếng (luôn tính tay, không phụ thuộc timezone local)
  const vnMillis = dateUTC.getTime() + 7 * 60 * 60 * 1000;
  const dateVN = new Date(vnMillis);

  // Format: YYYY/MM/DD HH:mm:ss
  const yyyy = dateVN.getUTCFullYear();
  const mm = String(dateVN.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dateVN.getUTCDate()).padStart(2, "0");
  const hh = String(dateVN.getUTCHours()).padStart(2, "0");
  const mi = String(dateVN.getUTCMinutes()).padStart(2, "0");
  const ss = String(dateVN.getUTCSeconds()).padStart(2, "0");

  return `${yyyy}/${mm}/${dd} ${hh}:${mi}:${ss}`;
}

function parseDateInput(inputStr) {
  const dt = new Date(inputStr.replace(/\//g, "-"));
  return dt;
}

/**
 * Convert chuỗi ngày Việt Nam ("YYYY/MM/DD HH:mm:ss" hoặc chỉ "YYYY/MM/DD")
 * sang định dạng "YYYY-MM-DD" để dùng cho TikTok Ads GMV API.
 *
 * Lưu ý:
 * - Chỉ lấy phần YEAR-MONTH-DAY, bỏ phần giờ.
 * - Không thay đổi timezone (chỉ format lại chuỗi).
 *
 * @function toTikTokGmvDateFormat
 * @param {string} inputStr - Chuỗi ngày có thể chứa giờ hoặc không.
 * @returns {string} Chuỗi theo format "YYYY-MM-DD".
 *
 * @example
 * toTikTokGmvDateFormat("2025/01/20 15:20:00");
 * // → "2025-01-20"
 */
export function toTikTokGmvDateFormat(inputStr) {
  const dt = parseDateInput(inputStr);
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, "0");
  const date = String(dt.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

/**
 * Convert từ "YYYY/MM/DD HH:mm:ss"
 * sang "YYYY-MM-DDTHH:mm:ss"
 * (giữ nguyên giờ, chỉ đổi format).
 *
 * @param {string} inputStr
 * @returns {string}
 */
export function toIsoLike(inputStr) {
  return inputStr.replace(/\//g, "-").replace(" ", "T");
}
