import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { filename } = req.query;
  const filePath = path.join(process.cwd(), 'data/imgs', filename);

  try {
    const imageBuffer = fs.readFileSync(filePath);
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(imageBuffer);
  } catch (error) {
    res.status(404).end();
  }
}