//controllers/admin.js
const { dataSource } = require('../db/data-source.js')
const Coaches = require('../db/entities/Coaches.js');
const coachesSkills = require('../db/entities/coaches_skills.js');
const skill = require('../db/entities/Skill.js')
const Users = require('../db/entities/Users.js');
const Courses = require('../db/entities/Courses.js');
const { validate } = require("uuid");
const { In } = require("typeorm");


const upgradeUserToCoach = async (req,res) => {

    const userId = req.params.userId;
    const { experience_years, description, profile_image_url } = req.body;

    if(
        !Number.isInteger(experience_years) 
        || 
        experience_years < 0
        || 
        typeof description !== "string"
        ||
        description.trim() === ""
        ||
        profile_image_url !== undefined
        &&
        (typeof profile_image_url !== "string"
        ||
        !profile_image_url.startsWith("https"))
    ){
        return res.status(400).json({
            status: "failed",
            message: "欄位未填寫正確"
        })
    };
    
    try{
        const userRepo = dataSource.getRepository(Users);

    const user = await userRepo.findOne({
        where:{
            id: userId
        }
    });

    if(!user){
        return res.status(400).json({
            status: "failed",
            message: "使用者不存在"
        })
    };
    
    const coachRepo = dataSource.getRepository(Coaches);

    const coach = await coachRepo.findOne({
        where:{
            user:{
                id: userId
            }
        }
    });
    if(coach){
        return res.status(400).json({
            status: "failed",
            message: "使用者已經是教練"
        })
    };

    const newCoach = coachRepo.create({
        experience_years,
        description,
        profile_image_url,
        user: user
    });

    const updateData = await dataSource.transaction(async (manager) => {

        const txUserRepo = manager.getRepository(Users);
        await txUserRepo.update(
            {id: userId},
            {role: "COACH"}
        );

        const txCoachRepo = manager.getRepository(Coaches);

        const savedCoach = await txCoachRepo.save(newCoach);
        return savedCoach;
    });
        return res.status(200).json({
            status: "success",
            data: {
                user: {
                    name: user.name,
                    role: "COACH"
                },
                coach:{
                    ...updateData
                }
            }
        });
    }catch(err){
        console.error(err);
        return res.status(500).json({
            status: "failed",
            message: "伺服器內部錯誤"
        });
    }
    
};

const getOneCoachData = async (req,res) => {
    const userId = req.user.id;
    const userRole = req.user.role;

    if(userRole !== "COACH"){
        return res.status(401).json({
            status: "failed",
            message: "使用者尚未成為教練"
        })
    }
    try{
        const coachRepo = dataSource.getRepository(Coaches);

        const coaches = await coachRepo.findOne({
            where:{
                user_id: userId
            }
        })

        const coachesSkillsRepo = dataSource.getRepository(coachesSkills);
        
        const coachesSkillRecords = await coachesSkillsRepo.
        find({
            where:{
                coaches_id: coaches.id
            }
        })

        const skillIds = coachesSkillRecords.map((skill) => {
            return skill.skills_id;
        })

        return res.status(200).json({
            status: "success",
            data:{
                id: coaches.id,
                experience_years: coaches.experience_years,
                description: coaches.description,
                profile_image_url: coaches.profile_image_url,
                skill_ids: skillIds,
            }
        })

    }catch(err){
        console.error(err);
        return res.status(500).json({
            status: "failed",
            message: "伺服器內部錯誤"
        });
    }
    
};

const updateCoachData = async (req,res) => {
    const coachBody = req.body;
    const userId = req.user.id;

    const userRole = req.user.role;
    if(userRole !== "COACH"){
        return res.status(401).json({
            status: "failed",
            message: "使用者尚未成為教練"
        })
    };

    const experienceYears = coachBody.experience_years;
    if(!Number.isInteger(experienceYears) || experienceYears < 0 ){
        return res.status(400).json({
            status: "failed",
            message: "欄位未填寫正確"
        })
    };

    const description = coachBody.description;
    if(typeof description !== "string" || description.trim() === ""){
        return res.status(400).json({
            status: "failed",
            message: "欄位未填寫正確"
        })
    };

    const profileImageUrl = coachBody.profile_image_url;
    if(typeof profileImageUrl !== "string" || profileImageUrl.trim() === "" || !profileImageUrl.startsWith("https://")){
        return res.status(400).json({
            status: "failed",
            message: "欄位未填寫正確"
        })
    };

    const skillIds = coachBody.skill_ids;
    if(!Array.isArray(skillIds) || skillIds.length === 0){
        return res.status(400).json({
            status: "failed",
            message: "欄位未填寫正確"
        })
    };

    const hasInvalidSkill = skillIds.some((skillId)=>{
        return !validate(skillId);
        });
    if(hasInvalidSkill){
        return res.status(400).json({
            status: "failed",
            message: "欄位未填寫正確"
        })
    };

    const coachRepo = dataSource.getRepository(Coaches);

    const getCoachData = await coachRepo.findOne({
        where:{
            user:{
                id: userId
            }
        }
    });

    if(!getCoachData){
        return res.status(400).json({
            status: "failed",
            message: "找不到對應的教練資料"
        })
    };

    const skillRepo = dataSource.getRepository(skill);

    const skills = await skillRepo.find({
        where:{
            id: In(skillIds)
        }
    })

    if (skills.length !== skillIds.length) {
        return res.status(400).json({
            status: "failed",
            message: "欄位未填寫正確"
    });
}
try {
  await dataSource.transaction(async (manager) => {

    const txCoachRepo = manager.getRepository(Coaches);

    const updateResult = await txCoachRepo.update(
      { id: getCoachData.id },
      {
        experience_years: experienceYears,
        description,
        profile_image_url: profileImageUrl
      }
    );

    if (updateResult.affected === 0) {
      throw new Error("更新教練資料失敗");
    }

    const txCoachSkillRepo = manager.getRepository(coachesSkills);
    
    await txCoachSkillRepo.delete({
        coaches_id: getCoachData.id
    });

    const newCoachSkills = skillIds.map((skillId) => {
        return {
            skills_id : skillId,
            coaches_id: getCoachData.id
        };
    });

    await txCoachSkillRepo.save(newCoachSkills);
    });

    const updatedCoach = await coachRepo.findOne({
        where:{
            id : getCoachData.id
        }
    });
    const coachSkillRepo = dataSource.getRepository(coachesSkills);

    const updatedCoachSkills = await coachSkillRepo.find({
        where: {
            coaches_id: getCoachData.id
        }
    });

    const updatedSkillIds = updatedCoachSkills.map((item) => {
        return item.skills_id;
    });

    return res.status(200).json({
        status: "success",
        data: {
            experience_years: updatedCoach.experience_years,
            description: updatedCoach.description,
            profile_image_url: updatedCoach.profile_image_url,
            skill_ids: updatedSkillIds
    }
});
} catch (error) {
  console.error("更新教練 API 錯誤:", error);

  return res.status(500).json({
    status: "failed",
    message: "更新教練資料失敗"
  });
    
}};

const getCoachCourses = async (req,res) => {
    const getUserRole = req.user.role;
    
    if(getUserRole !== "COACH"){
        return res.status(401).json({
            status: "failed",
            message: "使用者尚未成為教練"
        })
    };

    const userId = req.user.id
    const coachRepo = dataSource.getRepository(Coaches);

    const getCoachData = await coachRepo.findOne({
        where:{
            user_id : userId
        }
    });

    const coursesRepo = dataSource.getRepository(Courses);

    const coachesId = getCoachData.id
    const getCoursesData = await coursesRepo.find({
        where:{
            coaches_id: coachesId
        }
    })

    const now = new date();

    function getCourseStatus(now,start_at,end_at){
        if(now < start_at){
            return "尚未開始"
        }
        if(now >= start_at && now < end_at){
            return "進行中"
        }
        if(now >= end_at){
            return "已結束"
        }
    };

    const checkCourses = getCoursesData.map((course)=>{
        const newCourses = {
            ...course,
            status: getCourseStatus(now,course.start_at,course.end_at)
        }
        return newCourses;
    })


}

module.exports = {
    upgradeUserToCoach,
    getOneCoachData,
    updateCoachData,
    getCoachCourses,
};

