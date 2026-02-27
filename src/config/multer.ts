import multer from "multer";
import path from "path";

// Where images will be stored in your backend
const uploadPath = path.join(__dirname, "../../uploads");

// Storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    // UNIQUE filename → e.g. user_12345_1701231234.jpg
    const ext = path.extname(file.originalname);
    const uniqueName = `user_${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

// Filter allowed image types
function fileFilter(req: any, file: any, cb: any) {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only .png, .jpg and .jpeg formats allowed!"));
  }
}

// Export final uploader
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
