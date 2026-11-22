//controllers/users.js

const { dataSource } = require('../db/data-source.js')

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Users = require('../db/entities/Users.js');
const creditPurchases = require('../db/entities/Credit_purchases.js');
const Courses_bookings = require('../db/entities/Course_bookings.js');
const Courses = require('../db/entities/Courses.js');

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

const updateUsersPassword = async(req,res) => {
    const getBody = req.body;

    const password = {
        old: getBody.password,
        new: getBody.new_password,
        check: getBody.confirm_new_password
    };
    if(!password.old || !password.new || !password.check){
        return res.status(400).json({
            status: "failed",
            message: "欄位未填寫正確"
        })
    }

    const isValidPassword = (value) => {
        return (
            typeof value === "string" &&
            value.length >= 8 &&
            value.length <= 16 &&   
            /[A-Z]/.test(value) &&
            /[a-z]/.test(value) &&
            /[0-9]/.test(value)
        );
    };

    if(
        !isValidPassword(password.old) ||
        !isValidPassword(password.new) ||
        !isValidPassword(password.check)
    ){
        return res.status(400).json({
            status: "failed",
            message: "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
        })
    };

    const userRepo = dataSource.getRepository(Users);

    const userData = await userRepo.findOne({
        where:{
            id: req.user.id
        }
    });

    if(password.old === password.new){
        return res.status(400).json({
            status: "failed",
            message: "新密碼不能與舊密碼相同"
        })
    };
    if(password.new !== password.check){
        return res.status(400).json({
            status: "failed",
            message: "新密碼與驗證新密碼不一致"
        })
    };

    const isMatch = await bcrypt.compare(
        password.old,
        userData.password
    );
    if(!isMatch){
        return res.status(400).json({
            status: "failed",
            message: "密碼輸入錯誤"
        })
    };

    const newPassword = await bcrypt.hash(password.new, 12);

    const saveNewPassword = await userRepo.update(
        {id: req.user.id},
        {password: newPassword}
    );
    if(saveNewPassword.affected === 0){
        return res.status(400).json({
            status: "failed",
            message: "更新密碼失敗"
        })
    };

    return res.status(200).json({
        status: "success",
        data: null
    });
};

const getCreditPackageByUser = async (req,res) => {
    const getUserId = req.user.id;

    const creditPurchasesRepo = dataSource.getRepository(creditPurchases);

    const foundCreditPurchases = await creditPurchasesRepo.find({
        where:{
            users:{
                id: getUserId
            },
        },
        order:{
            purchase_at: "DESC"
            },
    });

    const resultCreditPurchases = foundCreditPurchases.map((purchases)=> {
        return {
            name: purchases.name,
            purchased_credits: purchases.purchased_credits,
            price_paid: Number(purchases.price_paid),
            purchase_at: purchases.purchase_at
        };
    });

    return res.status(200).json({
        status: "success",
        data: resultCreditPurchases
    });


};

const getCoursesByUser = async (req,res) => {
    const getUserId = req.user.id;

    const PurchasesRepo = dataSource.getRepository(creditPurchases);

    //購買紀錄，用來計算總購買堂數
    const foundPurchasesUser = await PurchasesRepo.find({
        where:{
            users:{
                id: getUserId
            },
        },
    });
    
    const coursesBookingRepo = dataSource.getRepository(Courses_bookings);

    //報名紀錄，用來整理課表
    const foundCoursesBooking = await coursesBookingRepo.find({
        where:{
            users:{
                id: getUserId
            },
        },
        relations:{
            courses: {
                coaches: {
                    user: true
                },
            },
        },
        order:{
            courses:{
                start_at: 'ASC'
        },
    },
});

    //計算個人的報購買紀錄的加總
    const purchases_credits = foundPurchasesUser.reduce((acc,purchase)=> {
        return acc + purchase.purchased_credits;
    },0);

    //計算個人已使用的堂數
    const notCancelled = foundCoursesBooking.filter((used)=>{
        return used.cancelled_at === null
    });
    const credit_usage = notCancelled.length;
    
    //計算剩餘堂數
    const credit_remain = purchases_credits - credit_usage;

    const course_booking = foundCoursesBooking.map((booking)=> {
        return {
            course_id: booking.courses.id,
            name: booking.courses.name,
            start_at: booking.courses.start_at,
            end_at: booking.courses.end_at,
            meeting_url: booking.courses.meeting_url,
            coach_name: booking.courses.coaches.user.name,
            cancelled_at: booking.cancelled_at
        };
    });

    return res.status(200).json({
        status: "success",
        data: {
            credit_remain : credit_remain,
            credit_usage : credit_usage,
            course_booking : course_booking
        },
    });
};

module.exports = {
    signupUsers,
    loginUsers,
    getUsersProfile,
    updateUsersProfile,
    updateUsersPassword,
    getCreditPackageByUser,
    getCoursesByUser
};