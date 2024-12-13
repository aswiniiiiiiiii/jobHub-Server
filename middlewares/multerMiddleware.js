const multer = require('multer')

const storage =multer.diskStorage({
    destination:(req,file,callback)=>{
        callback(null,"./uploads")
    },
    filename:(req,file,callback)=>{
        callback(null,`image-${Date.now()}-${file.originalname}`)
    }
})


const multerMiddleware = multer({
    storage,
    fileFilter: (req, file, callback) => {
        // Accept only PDF files
        if (file.mimetype === 'application/pdf' || 'image/png' ||'image/jpg' || 'image/jpeg') {
            callback(null, true); // Accept file
        } else {
            callback(new Error("Only PDF files are allowed!"), false); // Reject file
        }
    },
})
module.exports = multerMiddleware