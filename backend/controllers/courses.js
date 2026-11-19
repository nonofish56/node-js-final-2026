//controllers/courses.js

const { dataSource }= require('../db/data-source');
const Courses = require('../db/entities/Courses');


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



module.exports = {
    getAllCourses,
};