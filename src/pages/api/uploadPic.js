import fs from "fs";
import path from "path";
import multer from "multer";

// 配置 multer
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(process.cwd(), "public", "imgs");
      // 确保目录存在
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const fileName = `${Date.now()}.${file.mimetype.split("/")[1]}`;
      cb(null, fileName);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB 限制
  }
});

// 禁用默认的 body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// export default async function handler(req, res) {
//   console.log(req);
//   const formData = await req.formData();
//   const file = formData.get('file');
//   console.log(file);

//   const fileName = `${Date.now()}-${file.name}`;
//   const bytes = await file.arrayBuffer();
//   const buffer = Buffer.from(bytes);

//   const imgPath = path.join(process.cwd(), "data", "imgs", fileName);
//   fs.writeFileSync(imgPath, buffer);

//   console.log(imgPath);

//   res.status(200).json({
//     code: 0,
//     data: {
//       path: imgPath,
//     },
//   });
// }

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }


  // 使用 multer 处理文件上传
  upload.single('file')(req, res, function (err) {
    if (err) {
      console.error('Multer error:', err);
      return res.status(500).json({ status: "fail", error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ status: "fail", error: "No file uploaded" });
    }

    console.log('File uploaded:', req.file);
    // 返回成功响应
    return res.status(200).json({ 
      status: "success", 
      data: { 
        path: `/imgs/${req.file.filename}`,
        originalName: req.file.originalname,
        size: req.file.size
      } 
    });
  });
}