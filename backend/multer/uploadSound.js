const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/sounds');
  },
  filename: (req, file, cb) => {
    const originalname = file.originalname;
    const extension = originalname.slice((originalname.lastIndexOf('.') - 1 >>> 0) + 2);

    cb(null, `sound-${Date.now()}.${extension}`);
  }
});

const uploadSound = multer({ storage: storage }).single('filename');

module.exports = uploadSound;