//controller/coaches.js

const { dataSource } = require('../db/data-source.js')

const Skill = require('../db/entities/Skill.js');

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

module.exports = { 
    getSkills,
    postSkills
};