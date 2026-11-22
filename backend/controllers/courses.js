//controllers/courses.js

const { dataSource }= require('../db/data-source');
const Courses = require('../db/entities/Courses');
const CourseBookings = require('../db/entities/Course_bookings');
const CreditPurchases = require('../db/entities/Credit_purchases');

const { validate } = require('uuid');
const { IsNull } = require('typeorm');
const { LessThanOrEqual,MoreThan } = require('typeorm');

const getAllCourses = async(req,res) => {
    const coursesRepo = dataSource.getRepository(Courses);

    const now = new Date();

    const foundCourses = await coursesRepo.find({
        where:{
            start_at : LessThanOrEqual(now),
            end_at : MoreThan(now)
        },
        relations: {
            coaches: {
                user: true
            },
            skills: true
        }
    });

    const coursesMap = foundCourses.map((course)=> {
        return {
            id: course.id,
            name: course.name,
            description: course.description,
            start_at: new Date(course.start_at).toISOString(),
            end_at : new Date(course.end_at).toISOString(),
            max_participants: course.max_participants,
            coach_name: course.coaches.user.name,
            skill_name: course.skills.name
        }
    });
    return res.status(200).json({
        status: "success",
        data: coursesMap
    });
};

const postCourseId = async(req,res) => {
    const courseId = req.params.courseId;
    const userId = req.user.id;

    if(!validate(courseId)){
        return res.status(400).json({
            status: "failed",
            message: "ID錯誤"
        });
    };

    const coursesRepo = dataSource.getRepository(Courses);
    
    const foundOneCourse = await coursesRepo.findOne({
        where:{
            id: courseId
        }
    });

    if(!foundOneCourse){
        return res.status(400).json({
            status: "failed",
            message: "ID錯誤"
        });
    };
    
    const courseBookingsRepo = dataSource.getRepository(CourseBookings);

    const foundCourseBooking  = await courseBookingsRepo.findOne({
        where:{
            users:{
                id: userId
            },
            courses:{
                id:courseId
            },
        },
    });

    if(foundCourseBooking !== null){
        return res.status(400).json({
            status: "failed",
            message: "已經報名過此課程"
        });
    };

    const creditPurchasesRepo = dataSource.getRepository(CreditPurchases);
    

    const creditPurchases = await creditPurchasesRepo.find({
        where:{
            users:{
                id: userId
            },
        },
    });
    console.log(creditPurchasesRepo.metadata.tableName);
    // 購買總堂數
    const purchases_credits = creditPurchases.reduce((acc,credit)=>{
        return acc + credit.purchased_credits
    },0);

    const userCoursesData = await courseBookingsRepo.find({
        where:{
            users: {
                id: userId
            },
            cancelled_at: IsNull()
        },
    });

    //取得已使用堂數
    const credit_usage = userCoursesData.length;

    //計算剩餘堂數
    const credit_remain = purchases_credits - credit_usage;

    if(credit_remain <= 0){
        return res.status(400).json({
            status: "failed",
            message: "已無可使用堂數"
        });
    };

    const allCourseBookingsByNull = await courseBookingsRepo.find({
        where:{
            courses:{
                id: courseId
            },
            cancelled_at: IsNull()
        },
});
    if(foundOneCourse.max_participants <= allCourseBookingsByNull.length){
        return res.status(400).json({
            status: "failed",
            message: "已達最大參加人數，無法參加"
        });
    };

    const coursesBookingData = courseBookingsRepo.create({
        users: {
            id: userId
        },
        courses:{
            id: courseId
        },
        cancelled_at: null
    });

    await courseBookingsRepo.save(coursesBookingData);

    return res.status(201).json({
        status: "success",
        data: null
    });
};

const updateCourseById = async(req,res) =>{
    const courseId = req.params.courseId;
    const userId = req.user.id;
    
    if(!validate(courseId)){
        return res.status(400).json({
            status: "failed",
            message: "ID錯誤"
        });
    };

    const coursesBookingsRepo = dataSource.getRepository(CourseBookings);
    
    //資料庫查詢條件
    const foundCoursesData = await coursesBookingsRepo.findOne({
        where:{
            users:{
                id: userId
            },
            courses:{
                id: courseId
            },
            cancelled_at: IsNull()
        },
    });
    
    if(!foundCoursesData){
        return res.status(400).json({
            status: "failed",
            message: "ID錯誤"
        });
    };

    const now = new Date();

    const updateCourseBooking = await coursesBookingsRepo.update(foundCoursesData.id,{
    cancelled_at : now
    });

    return res.status(200).json({
        status: "success",
        data: null
    });
};



module.exports = {
    getAllCourses,
    postCourseId,
    updateCourseById,
};