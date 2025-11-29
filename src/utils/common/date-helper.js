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
