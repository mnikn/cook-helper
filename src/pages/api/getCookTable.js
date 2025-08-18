import fs from "fs";
import path from "path";

export default function handler(req, res) {
  // 读取 db.json 文件内容
  const dbPath = path.join(process.cwd(), "data", "db.json");
  let cookTableData = [];
  try {
    const fileContent = fs.readFileSync(dbPath, "utf-8");
    const jsonData = JSON.parse(fileContent);
    cookTableData = jsonData.cookTable || [];
  } catch (err) {
    // 读取或解析失败时，cookTableData 保持为空数组
    console.error("读取或解析 db.json 失败:", err);
  }

  res.status(200).json({
    code: 0,
    data: {
      cookTable: cookTableData,
    },
  });
}
