import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, "..", "..", "data", "2.txt");
const outputPath = path.join(__dirname, "..", "..", "data", "2_unique_skus.txt");

const raw = fs.readFileSync(inputPath, "utf8");

const lines = raw.split(/\r?\n/).filter(x => x.trim() !== "");
const unique = [...new Set(lines)];

fs.writeFileSync(outputPath, unique.join("\n"), "utf8");

console.log("Xong, sạch sẽ thơm tho.");
