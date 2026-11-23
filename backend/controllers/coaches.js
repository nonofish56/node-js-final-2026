//controller/coaches.js

const { dataSource } = require('../db/data-source.js')

const Skill = require('../db/entities/Skill.js');
const Coaches = require('../db/entities/Coaches.js');
const users = require('../db/entities/Users.js');
const Courses = require('../db/entities/Courses.js');
const CoachesSkills = require('../db/entities/coaches_skills.js');
const CourseBookings = require('../db/entities/Course_bookings.js');
const Package = require('../db/entities/Package.js');

const { validate } = require('uuid');
const { MoreThan } = require('typeorm');
const { In } = require('typeorm');
const { MoreThanOrEqual } = require('typeorm');
const { LessThan } = require('typeorm');
const { And } = require('typeorm');
const { IsNull } = require('typeorm');


const getSkills = async(req,res) => {
    const SkillRepo = dataSource.getRepository(Skill);

    const skills = await SkillRepo.find();

    return res.status(200).json({
        status: "success",
        data: skills
    });
};

const postSkills = async(req,res) => {
    const getName = req.body.name;

    if(!getName || typeof getName !== "string" || getName.trim() === ""){

        return res.status(400).json({
            status : "failed",
            message: "欄位未填寫正確"
        })
    }

    const skillRepo = dataSource.getRepository(Skill);

    const checkSkill = await skillRepo.findOne({
        where: {
            name :getName
        }
    })

    if(checkSkill){
        return res.status(409).json({
            status: "failed",
            message: "資料重複"
        })
    }

    const newSkill = skillRepo.create({
        name: getName
    });

    const saveSkill = await skillRepo.save(newSkill);

    return res.status(200).json({
        status: "success",
        data: saveSkill
    })
};

const deleteSkills = async(req,res) =>{
    const getId = req.params.id;

    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if(!uuidPattern.test(getId)){
        return res.status(400).json({
            status: "failed",
            message: "ID錯誤"
        })}

    const skillRepo = dataSource.getRepository(Skill);
    const checkSkill = await skillRepo.findOne({
        where:{
            id: getId
        }
    });

    if(!checkSkill){
        return res.status(400).json({
            status: "failed",
            message: "ID錯誤"
        })}


    const deleteSkill = await skillRepo.remove(checkSkill);
    return res.status(200).json({
        status: "success",
        data: deleteSkill
})
};

const getCoachPage = async(req,res) => {
    const getPer = req.query.per;
    const getPage = req.query.page;

    if(!getPer || !getPage){
        return res.status(400).json({
            status: "failed",
            message: "欄位未填寫正確"
        });
    };

    const isValue = (value) => {
        if(typeof value !== "string"){
            return false;
        }
        if(value.trim() === ""){
            return false;
        }
        const numberValue = Number(value);
        return Number.isInteger(numberValue) && numberValue >= 0;
    };
    
    if(
        !isValue(getPer) || !isValue(getPage) || Number(getPage) === 0
    ){
        return res.status(400).json({
            status: "failed",
            message: "欄位未填寫正確"
        });
    };

    const numberPer = Number(getPer);
    const numberPage = Number(getPage);
    
    const skip = (numberPage -1) * numberPer;

    const coachesRepo = dataSource.getRepository(Coaches);

    const result = await coachesRepo.find({
        skip: skip,
        take: numberPer,
        relations:{
            user: true
        }
    });

    const coachList = result.map((coach)=>{
        return {
            id: coach.id,
            user_id: coach.user_id,
            name: coach.user.name
        }
    });

    return res.status(200).json({
        status: "success",
        data: coachList
    });
};

const getCoachById = async(req,res) => {
    const coachId = req.params.coachId;

    if(!coachId || typeof coachId !== "string"){
        return res.status(400).json({
            status: "failed",
            message: "欄位未填寫正確"
        });
    };

    const checkValidate = validate(coachId);

    if(!checkValidate){
        return res.status(400).json({
            status: "failed",
            message: "找不到該教練"
        });
    }

    const coachRepo = dataSource.getRepository(Coaches);

    const foundCoach = await coachRepo.findOne({
        where:{
            id: coachId,
        },
        relations:{
            user: true
        }
    });

    if(!foundCoach){
        return res.status(400).json({
            status: "failed",
            message: "找不到該教練"
        });
    };

    const coachSkillRepo = dataSource.getRepository(CoachesSkills);

    const getCoachSkills = await coachSkillRepo.find({
        where:{
            coaches_id : foundCoach.id,
        }
    });

    const foundSkillsId = getCoachSkills.map((skills) => {
        return skills.skills_id
    });

    const skillRepo = dataSource.getRepository(Skill);
    
    const getSkill = await skillRepo.find({
        where:{
            id: In(foundSkillsId)
        }
    });

    const skillList = getSkill.map(s => s.name);

    return res.status(200).json({
        status: "success",
        data: {
            user:{
                name: foundCoach.user.name,
                role: foundCoach.user.role
            },
            coach:{
                id: foundCoach.id,
                user_id: foundCoach.user_id,
                experience_years: foundCoach.experience_years,
                description: foundCoach.description,
                profile_image_url: foundCoach.profile_image_url,
                created_at: foundCoach.created_at,
                updated_at: foundCoach.updated_at,
                skills: skillList
            },
        },
    });
};

const getCoachCourses = async(req,res) => {
    const coachId = req.params.coachId;

    if(!coachId || typeof coachId !== "string" || coachId.trim() === ""){
        return res.status(400).json({
            status: "failed",
            message: "欄位未填寫正確"
        });
    };
    const checkValidate = validate(coachId);

    if(!checkValidate){
        return res.status(400).json({
            status: "failed",
            message: "找不到該教練" 
        });
    };

    const coachRepo = dataSource.getRepository(Coaches);

    const foundCoach = await coachRepo.findOne({
        where:{
            id : coachId,
        },
        relations:{
            user: true
        }
    });

    const coursesRepo = dataSource.getRepository(Courses);

    const now = new Date();

    const foundCourses = await coursesRepo.find({
        where:{
            coaches_id : foundCoach.id,
            end_at : MoreThan(now)
        },
        relations:{
            skills: true
        }
    });

    const resultSkillsByCoach = foundCourses.map((course)=>{
        return {
            id: course.id,
            name: course.name,
            description: course.description,
            start_at : new Date(course.start_at).toISOString(),
            end_at : new Date(course.end_at).toISOString(),
            coach_name : foundCoach.user.name,
            skill_name : course.skills.name,
            max_participants : course.max_participants 
        };
    });

    return res.status(200).json({
        status: "success",
        data: resultSkillsByCoach
    });
};

const getCoachRevenue = async(req,res) => {
    const userId = req.user.id;
    const userRole = req.user.role;

    if(userRole !== "COACH"){
        return res.status(401).json({
            status: "failed",
            message: "使用者尚未成為教練"
        });
    };

    const month = req.query.month;
    
    if(!month || typeof month !== "string"){
        return res.status(400).json({
            status: "failed",
            message: "欄位未填寫正確"
        });
    };
    
    const valueMonth = [
        "january","february",
        "march","april","may",
        "june","july","august",
        "september","october","november","december"
    ];

    if(!valueMonth.includes(month)){
        return res.status(400).json({
            status: "failed",
            message: "欄位未填寫正確"
        });
    };

    const coachesRepo = dataSource.getRepository(Coaches);

    //資料庫取得教練id符合使用者id
    const foundOneCoach = await coachesRepo.findOne({
        where:{
            user_id: userId
            },
        },
    );

    const coursesRepo = dataSource.getRepository(Courses);

    //資料庫取得教練id跟課程id相符的資料
    const foundCourseCoachId = await coursesRepo.find({
        where:{
            coaches_id : foundOneCoach.id
        },
    });

    if(foundCourseCoachId.length === 0){
         return res.status(200).json({
            status: "success",
            data:{
                total:{
                    revenue: 0,
                    participants: 0,
                    course_count: 0
                },
            },
        });
    };

    //英文月份轉換成數字索引
    const monthIndexOf = valueMonth.indexOf(month);

    //建立取得今天的年份
    const thisYear = new Date().getFullYear();

    //建立指定月份的起始時間
    const startDate = new Date(thisYear,monthIndexOf,1);

    //建立下個月的起始日期
    const nextMonth = monthIndexOf + 1;
    const nextDate = new Date(thisYear,nextMonth,1);

    
    const coursesBookingsRepo = dataSource.getRepository(CourseBookings);

    //將foundCourseCoachId轉換資料結構
    const changeCoursesId = foundCourseCoachId.map((courseId)=>{
        return courseId.id
    })

    //查詢該教練的課程，報名建立時間落在指定月份，尚未取消的報名紀錄
    const foundCoachesBookings = await coursesBookingsRepo.find({
        where:{
            courses:{
                id: In(changeCoursesId)
            },
            created_at: And(
                MoreThanOrEqual(startDate),
                LessThan(nextDate),
            ),
            cancelled_at: IsNull()
        },
        relations:{
            users: true
        }
    });
    
    const creditPackagesRepo = dataSource.getRepository(Package);

    //計算該月未取消的報名比數
    const course_count = foundCoachesBookings.length;

    //計算該月不重複報名的學員數
    const studentIds = foundCoachesBookings.map((student)=>{
        return student.users.id
    });
    //去除重複值
    const studentIdsSet = new Set(studentIds);

    //不重複學員數的結果
    const participants = studentIdsSet.size;
    
    //取得所有堂數方案
    const getAllPackages = await creditPackagesRepo.find();

    //加總所有方案的金額
    const getAllPrice = getAllPackages.reduce((acc,item)=>{
        return acc + Number(item.price)
    },0);

    //加總所有方案的堂數
    const getAllCreditAmount = getAllPackages.reduce((acc,item)=>{
        return acc + item.credit_amount  
    },0);
    
    //計算單堂均數＝總價格/總堂數
    const averagePrice = getAllPrice / getAllCreditAmount;

    //計算營收
    const revenue = Math.floor(course_count * averagePrice);
    
    return res.status(200).json({
        status: "success",
        data:{
            total:{
                revenue: revenue,
                participants: participants,
                course_count: course_count
            },
        },
    });
};
    


module.exports = { 
    getSkills,
    postSkills,
    deleteSkills,
    getCoachPage,
    getCoachById,
    getCoachCourses,
    getCoachRevenue,
};