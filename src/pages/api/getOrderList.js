import fs from "fs";
import path from "path";
import dayjs from "dayjs";

export default function handler(req, res) {
  const dbPath = path.join(process.cwd(), "src", "data", "db.json");
  const fileContent = fs.readFileSync(dbPath, "utf-8");
  const jsonData = JSON.parse(fileContent);
  let orderList = jsonData.orderList || [];
  orderList = orderList.sort((a, b) => {
    return dayjs(b.time).diff(dayjs(a.time));
  });

  res.status(200).json({
    code: 0,
    data: {
      orderList: orderList,
    },
  });
}
