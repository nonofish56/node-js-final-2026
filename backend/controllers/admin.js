//controllers/admin.js
const { dataSource } = require('../db/data-source.js')
const Coaches = require('../db/entities/Coaches.js');
const coachesSkills = require('../db/entities/coaches_skills.js');
const Users = require('../db/entities/Users.js');


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

module.exports = {
    upgradeUserToCoach,
    getOneCoachData,
};

