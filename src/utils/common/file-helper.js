import fs from "fs";
import path from "path";

/**
 * Ghi dữ liệu ra file JSON. Tự động tạo thư mục nếu chưa tồn tại.
 *
 * Có 2 chế độ:
 *  - Ghi đè (mặc định)
 *  - Ghi nối thêm vào file có sẵn (append)
 *
 * Nếu append = true:
 *  - Nếu file chứa array → ghép array cũ + array mới
 *  - Nếu file chứa object → merge object cũ + object mới
 *
 * @function writeJsonFile
 *
 * @param {string} relativePath - Đường dẫn tương đối tới file JSON (vd: "./src/data/orders.json")
 * @param {any} data - Dữ liệu cần ghi (object, array, string, number...)
 * @param {boolean} [append=false] - Có ghi nối thêm không (false = ghi đè)
 *
 * @returns {void}
 *
 * @example
 * writeJsonFile("./data/items.json", [{ id: 1 }]);
 *
 * @example
 * writeJsonFile("./data/log.json", { time: Date.now() }, true);
 */
export function writeJsonFile(relativePath, data, append = false) {
  try {
    const filePath = path.resolve(relativePath);
    const dir = path.dirname(filePath);

    // Tạo folder nếu chưa có
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }

    // Ghi file
    const jsonData = JSON.stringify(data, null, 2);
    if (append && fs.existsSync(filePath)) {
      // Ghi nối thêm
      const current = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const merged = Array.isArray(current)
        ? [...current, ...data]
        : { ...current, ...data };
      fs.writeFileSync(filePath, JSON.stringify(merged, null, 2));
    } else {
      fs.writeFileSync(filePath, jsonData);
    }

    console.log(`Saved data to ${filePath}`);
  } catch (err) {
    console.error(`Error writing to ${relativePath}:`, err.message);
  }
}

/**
 * Đọc file JSON từ đường dẫn tương đối.
 * Nếu file không tồn tại hoặc lỗi parse thì trả về mảng rỗng.
 *
 * @function readJsonFile
 *
 * @param {string} relativePath - Đường dẫn tương đối đến file JSON
 * @returns {any} Dữ liệu parsed từ file hoặc [] nếu file không tồn tại / lỗi
 *
 * @example
 * const data = readJsonFile("./src/data/orders.json");
 * console.log(data);
 */
export function readJsonFile(relativePath) {
  try {
    const filePath = path.resolve(relativePath);
    if (!fs.existsSync(filePath)) return [];
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return data;
  } catch (err) {
    console.error(`Error reading ${relativePath}:`, err.message);
    return [];
  }
}
