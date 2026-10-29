//controllers/users.js

const { dataSource } = require('../db/data-source.js')

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
};

const loginUsers = async(req,res) => {
    const { email,password } = req.body;
    if(!email || !password){
        return res.status(400).json({
            status: "failed",
            message: "欄位未填寫正確"
        })
    }
    if(password.length < 8 || password.length > 16 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        return res.status(400).json({
            status: "failed",
            message: "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
        })
    }

    const userRepo = dataSource.getRepository(Users);

    const getUser = await userRepo.findOne({
        where:{
            email: email
        }
    })

    if(!getUser) {
        return res.status(400).json({
            status: "failed",
            message: "使用者不存在或密碼輸入錯誤"
        })
    }

    const isMatch = await bcrypt.compare(password,getUser.password)
    if(!isMatch) {
        return res.status(400).json({
            status: "failed",
            message: "使用者不存在或密碼輸入錯誤"
        })
    }

    const payload = {
        id: getUser.id,
        role: getUser.role
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.status(201).json({
        status: "success",
        data:{
            token: token,
        user:{
            name: getUser.name
        }}
    })
};

const getUsersProfile = async(req,res) => {
    const userId = req.user.id;

    const getRepo = dataSource.getRepository(Users);

    const getUser = await getRepo.findOne({
        where:{
            id: userId
        }
    })
    if(!getUser){
        return res.status(401).json({
            status: "failed",
            message: "無效的token"
        })
    }

    const getUserData = {
        name: getUser.name,
        email: getUser.email
    };
    return res.status(200).json({
        status: "success",
        data:{
            user:{
                ...getUserData
            }
        } 
    })

};

const updateUsersProfile = async(req,res) => {
    const updateBody = req.body.name;

    if(!updateBody){
        return res.status(400).json({
            status: "failed",
            message: "欄位未填寫正確"
        })
    }

    const userRepo = dataSource.getRepository(Users);

    const userData = await userRepo.findOne({
        where:{
            id: req.user.id
        }
    })
    if(updateBody === userData.name){
        return res.status(400).json({
            status: "failed",
            message: "使用者名稱未變更"
        })
    };
    
    const newUserData = await userRepo.update(
        {id: req.user.id},
        {name: updateBody}
    );

    if(newUserData.affected === 0){
        return res.status(400).json({
            status: "failed",
            message: "更新使用者資料失敗"
        })
    };
    return res.status(200).json({
        status: "success",
        data:{
            user:{
                name: updateBody
            }
        }
    });
};

module.exports = {
    signupUsers,
    loginUsers,
    getUsersProfile,
    updateUsersProfile,
};