/**
 * Chia một mảng lớn thành nhiều mảng nhỏ theo kích thước quy định.
 *
 * Thường dùng để batch insert/update (Lark, Supabase, TikTok API...).
 * Nếu mảng rỗng hoặc không phải array thì trả về mảng rỗng.
 *
 * @function chunkArray
 * @param {Array} array - Mảng cần chia thành nhiều phần.
 * @param {number} [size=1000] - Số phần tử tối đa trong mỗi chunk.
 *
 * @returns {Array<Array>} Một mảng gồm nhiều mảng con,
 * mỗi mảng có tối đa `size` phần tử.
 *
 * @example
 * chunkArray([1,2,3,4,5], 2);
 * // Kết quả: [[1,2], [3,4], [5]]
 *
 * @example
 * chunkArray(["a","b","c"], 10);
 * // Vì size lớn hơn length => [[ "a","b","c" ]]
 */
export function chunkArray(array = [], size = 1000) {
  if (!Array.isArray(array)) return [];
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
