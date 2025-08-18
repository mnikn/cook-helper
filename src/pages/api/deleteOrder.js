import fs from "fs";
import path from "path";
import dayjs from "dayjs";

export default function handler(req, res) {
  const reqData = req.body;
  const { id } = JSON.parse(reqData);

  const dbPath = path.join(process.cwd(), "data", "db.json");
  const fileContent = fs.readFileSync(dbPath, "utf-8");
  const jsonData = JSON.parse(fileContent);
  jsonData.orderList = jsonData.orderList.filter((item) => item.id !== id);
  fs.writeFileSync(dbPath, JSON.stringify(jsonData, null, 2));

  res.status(200).json({
    code: 0,
    data: {
      id,
      msg: "删除成功",
    },
  });
}
