const multer = require('multer');
const path = require('path');

// 1. Storage Setting (Disk par save karne ke liye)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // 📁 Yeh woh folder hai jahan files save hongi
  },
  filename: (req, file, cb) => {
    // 🏷️ File ka unique naam banane ke liye: timestamp + random number
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 2. File Filter (Sirf images allow karne ke liye)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
    cb(null, true); // File accept kar lo
  } else {
    cb(new Error('Only images (jpeg, jpg, png, webp) are allowed!'), false); // Reject kar do
  }
};

// 3. Multer Instance Initialize karein
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // ⚖️ Limit: 2MB max
});

module.exports = upload;