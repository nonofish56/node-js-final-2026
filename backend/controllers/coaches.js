//controller/coaches.js

const { dataSource } = require('../db/data-source.js')

const Skill = require('../db/entities/Skill.js');
const Coaches = require('../db/entities/Coaches.js');

const { validate } = require('uuid');
const CoachesSkills = require('../db/entities/coaches_skills.js');

const { In } = require('typeorm');

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


module.exports = { 
    getSkills,
    postSkills,
    deleteSkills,
    getCoachPage,
    getCoachById
};