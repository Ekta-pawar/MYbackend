import multer from "multer";// Upload file image on cloudinary
const storage = multer.diskStorage({
  destination: function (req, file, cb) {//cb means callback
    cb(null, "Public/temp")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)//original name of image
  }
})

const upload = multer({ 
    storage,

})
export default upload;