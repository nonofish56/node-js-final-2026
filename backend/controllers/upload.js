// controllers/upload.js

const cloudinary = require('cloudinary').v2;

const postUpload = async(req,res) =>{

    const file = req.file;
    
    if(!file){
        return res.status(400).json({
            status: "failed",
            message: "請上傳圖片"
        });
    };
    //取得前端傳入的檔案格式並驗證是否符合條件
    const file_mimetype = [
        "image/jpeg","image/png"
    ];
    if(!file_mimetype.includes(file.mimetype)){
        return res.status(400).json({
            status: "failed",
            message: "僅接受JPG或PNG圖片"
        });
    };
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret:process.env.CLOUDINARY_API_SECRET
    });

    //建立上傳工具
    //uploadStream負責傳送圖片資料的工具
    //result圖片上傳完成後 cloudinary回傳的結果
    const uploadStream = cloudinary.uploader.upload_stream(
        {},
        (error,result) => {
            if(error){
                console.log(error.message);
                return res.status(500).json({
                    status: "failed",
                    message: "圖片上傳失敗"
                });
            };
            return res.status(200).json({
                status: "success",
                data: {
                    image_url: result.secure_url
                },
            });
        },
    );
    uploadStream.end(file.buffer);
    console.log({
    cloudName: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    apiKey: Boolean(process.env.CLOUDINARY_API_KEY),
    apiSecret: Boolean(process.env.CLOUDINARY_API_SECRET)
});
};

module.exports = {
    postUpload,
}