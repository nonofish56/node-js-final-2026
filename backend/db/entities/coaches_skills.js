const { EntitySchema } = require('typeorm');

const CoachesSkills = new EntitySchema({
    name: 'CoachesSkills',
    tableName: 'coaches_skills',

    columns:{
        coaches_id:{
            type: 'uuid',
            primary: true,
            nullable: false,
        },
        skills_id: {
            type:'uuid',
            primary: true,
            nullable: false,
        },
    },

    relations: {
        coaches: {
            type: 'many-to-one',
            target: 'Coaches',
            joinColumn: {
            name: 'coaches_id',
            referencedColumnName: 'id',
            }        
        },
        skills: {
            type: 'many-to-one',
            target: 'Skill',
            joinColumn: {
                name: 'skills_id',
                referencedColumnName: 'id',
            }
        }
    }
});


module.exports = CoachesSkills;