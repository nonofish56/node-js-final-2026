const jwt = require('jsonwebtoken')

const verifyToken = (req,res,next) =>{
    const authorization = req.headers.authorization;

    if(!authorization) {
        return res.status(401).json({
            status: "failed",
            message: "請先登入"
        })
    }
    const token = authorization.split(' ')[1];

    if(!authorization.startsWith('Bearer ')) {
        return res.status(401).json({
            status: "failed",
            message: "請先登入"
        })
    }
    if(!token) {
        return res.status(401).json({
            status: "failed",
            message: "請先登入"
        })
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
    }
    catch(error){
        return res.status(401).json({
            status: "failed",
            message: "token 已過期"
        })}

    next();
};



module.exports = verifyToken;