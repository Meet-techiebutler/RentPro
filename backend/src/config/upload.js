const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '../../uploads/properties');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `prop-${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, webp, gif)'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024, files: 10 } });

const deleteLocalImage = (filePath) => {
  try {
    const abs = path.join(__dirname, '../../', filePath.replace(/^\//, ''));
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch {}
};

module.exports = { upload, deleteLocalImage };
