/**
 * Chuyển datetime dạng "YYYY/MM/DD HH:mm:ss" sang timestamp UTC (milliseconds).
 * - Tự thay "/" thành "-" và thêm "T" để new Date parse chuẩn.
 * - Cuối chuỗi thêm "+00:00" để ép về UTC.
 *
 * @param {string} datetimeStr Chuỗi ngày giờ VN.
 * @returns {number} Timestamp UTC tính bằng milliseconds.
 */
export function vnTimeToUTCTimestampMiliseconds(datetimeStr) {
  const iso = datetimeStr.replace(/\//g, "-").replace(" ", "T") + "+00:00";
  return new Date(iso).getTime();
}

/**
 * Parse chuỗi ngày dạng "YYYY/MM/DD" hoặc "YYYY-MM-DD" thành đối tượng Date.
 * - Không đổi timezone, dùng local timezone của máy chạy code.
 *
 * @param {string} inputStr Chuỗi ngày.
 * @returns {Date} Đối tượng Date.
 */
function parseDateInput(inputStr) {
  const dt = new Date(inputStr.replace(/\//g, "-"));
  return dt;
}

/**
 * Convert date thành format "YYYY-MM-DD" để gọi TikTok GMV API.
 * - Input có thể là "YYYY/MM/DD" hoặc "YYYY-MM-DD".
 * - Output luôn chuẩn YYYY-MM-DD.
 *
 * @param {string} inputStr Ngày input.
 * @returns {string} Chuỗi ngày chuẩn YYYY-MM-DD.
 */
export function toTikTokGmvDateFormat(inputStr) {
  const dt = parseDateInput(inputStr);
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, "0");
  const date = String(dt.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

/**
 * Chuyển "YYYY/MM/DD HH:mm:ss" → "YYYY-MM-DDTHH:mm:ss".
 * - Chỉ đổi dấu "/" thành "-" và thêm "T".
 * - Không đổi timezone.
 *
 * @param {string} inputStr Chuỗi ngày giờ.
 * @returns {string} Chuỗi ISO-like.
 */
export function toIsoLike(inputStr) {
  return inputStr.replace(/\//g, "-").replace(" ", "T");
}

/**
 * Convert thời gian VIỆT NAM (UTC+7) sang timestamp UTC giây.
 * - Input dạng "YYYY/MM/DD HH:mm:ss".
 * - Vì là giờ VN, cần trừ 7 giờ để ra UTC.
 * - Trả về timestamp UTC tính bằng giây.
 *
 * @param {string} datetimeStr Chuỗi ngày giờ VN.
 * @returns {number} Timestamp UTC giây.
 */
export function vnTimeToUtcTimestamp(datetimeStr) {
  // Chuyển "YYYY/MM/DD HH:mm:ss" => ["YYYY", "MM", "DD", "HH", "mm", "ss"]
  const [datePart, timePart] = datetimeStr.split(" ");
  const [year, month, day] = datePart.split(/[-/]/).map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);

  // Vì đây là giờ VIỆT NAM => ta convert sang UTC bằng cách -7 giờ
  const utcMillis = Date.UTC(year, month - 1, day, hour - 7, minute, second);

  return Math.floor(utcMillis / 1000);
}

export function utcTimestampToVn(ts) {
  const d = new Date(ts * 1000);

  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");

  return `${yyyy}/${mm}/${dd} ${hh}:${mi}:${ss}`;
}


export function vnTimeToUTCTimestampRaw(datetimeStr) {
  const normalized = datetimeStr.replace(/\//g, "-");
  const dateVN = new Date(normalized);
  return Math.floor(dateVN.getTime() / 1000);
}

/**
 * Mở rộng khoảng ngày bằng cách trừ thêm ngày ở đầu và cộng thêm ngày ở cuối,
 * sau đó trả về kết quả dưới dạng chuỗi thời gian "YYYY/MM/DD HH:mm:ss".
 *
 * Dùng khi cần lấy dữ liệu rộng hơn so với filter gốc để tránh sai lệch timezone,
 * hoặc cần query API/Lark dư range cho an toàn.
 *
 * @function expandDateRangeByDay
 *
 * @param {string|Date} startDate - Ngày bắt đầu gốc (chuỗi hoặc đối tượng Date).
 * @param {string|Date} endDate - Ngày kết thúc gốc (chuỗi hoặc đối tượng Date).
 * @param {number} [startDayOffset=7] - Số ngày cần lùi thêm từ ngày bắt đầu.
 * @param {number} [endDayOffset=7] - Số ngày cần cộng thêm vào ngày kết thúc.
 *
 * @returns {{ start: string, end: string }}
 * Một object gồm:
 * - `start`: ngày bắt đầu sau khi lùi thêm, format "YYYY/MM/DD HH:mm:ss"
 * - `end`: ngày kết thúc sau khi cộng thêm, format tương tự
 *
 * @example
 * expandDateRangeByDay("2025/01/10 00:00:00", "2025/01/20 23:59:59", 3, 5);
 * // Kết quả:
 * // {
 * //   start: "2025/01/07 00:00:00",
 * //   end:   "2025/01/25 23:59:59"
 * // }
 */

export function expandDateRangeByDay(startDate, endDate, startDayOffset = 7, endDayOffset = 7) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  start.setDate(start.getDate() - startDayOffset);
  end.setDate(end.getDate() + endDayOffset);

  // Format theo kiểu Việt Nam "YYYY/MM/DD HH:mm:ss"
  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const s = String(date.getSeconds()).padStart(2, "0");
    return `${y}/${m}/${d} ${h}:${mi}:${s}`;
  };

  return {
    start: formatDate(start),
    end: formatDate(end),
  };
}

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));