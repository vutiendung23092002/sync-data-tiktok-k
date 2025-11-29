/**
 * Kiểm tra một chuỗi có đúng định dạng ngày giờ "YYYY/MM/DD HH:mm:ss"
 * và có phải là một thời điểm hợp lệ trong thực tế hay không.
 *
 * Cách kiểm tra:
 * 1. Regex để chắc chắn format hợp lệ 100%.
 * 2. Tách các phần tử (year, month, day, hour, minute, second).
 * 3. Kiểm tra từng thành phần có nằm trong khoảng cho phép.
 * 4. Tạo Date object để phát hiện ngày không tồn tại
 *    (ví dụ: 2025/02/30 tự nhảy thành 2025/03/02 → bị reject).
 *
 * @function isValidDateTimeString
 *
 * @param {string} s - Chuỗi datetime dạng "YYYY/MM/DD HH:mm:ss"
 * @returns {boolean} Trả về true nếu chuỗi đúng format và là ngày giờ hợp lệ.
 *
 * @example
 * isValidDateTimeString("2025/01/31 23:59:59"); // true
 * isValidDateTimeString("2025/02/30 10:20:00"); // false (ngày không tồn tại)
 * isValidDateTimeString("2025/13/10 10:20:00"); // false (tháng không hợp lệ)
 * isValidDateTimeString("hello world"); // false
 */
export function isValidDateTimeString(s) {
    if (typeof s !== "string") return false;
    const raw = s.trim();
    const re = /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/;
    if (!re.test(raw)) return false;

    // parse components
    const [datePart, timePart] = raw.split(" ");
    const [yyyy, mm, dd] = datePart.split("/").map((v) => Number(v));
    const [HH, MM, SS] = timePart.split(":").map((v) => Number(v));

    // basic ranges
    if (mm < 1 || mm > 12) return false;
    if (dd < 1 || dd > 31) return false;
    if (HH < 0 || HH > 23) return false;
    if (MM < 0 || MM > 59) return false;
    if (SS < 0 || SS > 59) return false;

    // construct Date (treat as local)
    const dt = new Date(yyyy, mm - 1, dd, HH, MM, SS);
    if (Number.isNaN(dt.getTime())) return false;

    // check that Date normalized equals input components (catches invalid days like 2025/02/30)
    if (
        dt.getFullYear() !== yyyy ||
        dt.getMonth() + 1 !== mm ||
        dt.getDate() !== dd ||
        dt.getHours() !== HH ||
        dt.getMinutes() !== MM ||
        dt.getSeconds() !== SS
    ) {
        return false;
    }

    return true;
}