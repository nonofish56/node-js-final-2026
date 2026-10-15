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


module.exports = { 
    getSkills,
    postSkills,
    deleteSkills
};