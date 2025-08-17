import fs from "fs";
import path from "path";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

export default function handler(req, res) {
  const reqData = req.body;
  const { order } = JSON.parse(reqData);

  const dbPath = path.join(process.cwd(), "src", "data", "db.json");
  const fileContent = fs.readFileSync(dbPath, "utf-8");
  const jsonData = JSON.parse(fileContent);
  jsonData.orderList.push({
    ...order,
    id: uuidv4()
  });
  fs.writeFileSync(dbPath, JSON.stringify(jsonData, null, 2));

  res.status(200).json({
    code: 0,
    data: {
      order,
    },
  });
}
