// routes/upload.js
const express = require('express');
const router = express.Router();

const multer = require('multer');
const verifyToken  = require('../middleware/verifyToken');

const { postUpload } = require('../controllers/upload');

//建立Multer的記憶體儲存引擎
    const memoryStorage = multer.memoryStorage();

    //將memoryStorage帶入multer()的設定物件
    const upload = multer({
        storage: memoryStorage,
        limits:{  //在同一個設定物件內加入limits，限制上傳檔案的大小
            fileSize: 2 * 1024 * 1024
        },
    });

//upload.single("file") 要加入到router上
router.post('/',verifyToken,upload.single("file"),postUpload);

module.exports = router;