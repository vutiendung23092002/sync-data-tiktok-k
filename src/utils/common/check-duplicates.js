import fs from "fs";

// Đọc nội dung file
const data = fs.readFileSync("./1.txt", "utf8");

// Tách từng dòng, loại bỏ dòng trống và khoảng trắng
const lines = data
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(Boolean);

const counts = {};
const duplicates = [];

// Đếm số lần xuất hiện
for (const line of lines) {
  counts[line] = (counts[line] || 0) + 1;
}

// Tìm các giá trị trùng lặp (>= 2 lần)
for (const [key, value] of Object.entries(counts)) {
  if (value > 1) {
    duplicates.push({ value: key, count: value });
  }
}

// In kết quả
if (duplicates.length > 0) {
  console.log("✅ Các giá trị trùng lặp:");
  duplicates.forEach(d => console.log(`${d.value} (${d.count} lần)`));
} else {
  console.log("🎉 Không có giá trị nào bị trùng!");
}
