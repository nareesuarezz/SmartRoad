const multer = require('multer');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('hola')
        cb(null, './public/images');
    },
    filename: (req, file, cb) => {
        var filetype = '';
        if (file.mimetype === 'image/gif') {
            filetype = 'gif';
        }
        if (file.mimetype === 'image/png') {
            filetype = 'png';
        }
        if (file.mimetype === 'image/jpeg') {
            filetype = 'jpg';
        }
        console.log('hola2')
        cb(null, 'image-' + Date.now() + '.' + filetype);

    }
});

var upload = multer({ storage: storage }).single('filename');

module.exports = upload;
