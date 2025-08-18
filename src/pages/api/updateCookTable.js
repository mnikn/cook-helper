import fs from "fs";
import path from "path";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "999999mb", // Set desired value here
    },
  },
};

export default function handler(req, res) {
  const reqData = req.body;
  const { item } = JSON.parse(reqData);

  const dbPath = path.join(process.cwd(), "data", "db.json");
  const fileContent = fs.readFileSync(dbPath, "utf-8");
  const jsonData = JSON.parse(fileContent);
  for (let i = 0; i < jsonData.cookTable.length; i++) {
    if (jsonData.cookTable[i].id === item.id) {
      jsonData.cookTable[i] = item;
      break;
    }
  }
  fs.writeFileSync(dbPath, JSON.stringify(jsonData, null, 2));

  res.status(200).json({
    code: 0,
  });
}
