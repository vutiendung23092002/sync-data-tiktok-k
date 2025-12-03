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