//controllers/users.js

const { dataSource } = require('../db/data-source.js')

const bcrypt = require('bcrypt');

const Users = require('../db/entities/Users.js')

const signupUsers = async(req,res) => {

    const body = req.body;

   if(!body.name || !body.email || !body.password){
    return res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確"
    })
   };

   const checkPassword = req.body.password;

   if(typeof checkPassword !== "string") {
        return res.status(400).json({
            status: "failed",
            message: "欄位未填寫正確"
        })
    };
    if(checkPassword.length < 8 || checkPassword.length > 16 || !/[A-Z]/.test(checkPassword) || !/[a-z]/.test(checkPassword) || !/[0-9]/.test(checkPassword)) {
        return res.status(400).json({
            status: "failed",
            message: "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
        })
    };
    const checkEmail = req.body.email;

    const userRepo = dataSource.getRepository(Users);

    const emailData = await userRepo.findOne({
        where: {
            email: checkEmail
        }
    })
    if(emailData) {
        return res.status(409).json({
            status: "failed",
            message: "email已被使用"
        })
    }

    const hashedPassword = await bcrypt.hash(checkPassword,10);

    const newUser = userRepo.create({
        name: body.name,
        email: checkEmail,
        password: hashedPassword
    })

    const saveUser = await userRepo.save({
        ...newUser
    })

    return res.status(201).json({
        status: "success",
        data:{
            user:{
                id: saveUser.id,
                name: saveUser.name,
            }
            
        }
    })
}

module.exports = {
    signupUsers,
};