const multer = require('multer');
const fs = require('fs')
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        const path = `./uploads/gallery/`
        fs.mkdirSync(path, { recursive: true })
        cb(null,path);
    },
    filename:(req,file,cb)=>{
        cb(null,new Date().toISOString()+file.originalname);
    }
})
const fileFilter=(req,file,cb)=>{
    if(file.mimetype==='image/jpeg' || file.mimetype==='image/png')
        cb(null,true);
    else
        cb(null,false);
}
const upload=multer({
    storage:storage,
    limits:{
        fileSize: 1024 * 1024 * 5
    },
    fileFilter:fileFilter  
})

module.exports = upload;