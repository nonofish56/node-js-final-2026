const { EntitySchema } = require('typeorm');

const Courses = new EntitySchema ({
    name: 'Courses',
    tableName: 'courses',

        columns: {
            id: {
                type: 'uuid',
                primary: true,
                generated: 'uuid'
            },
            coaches_id: {
                type: 'uuid',
                nullable: false
            },
            name: {
                type: 'varchar',
                nullable: false,
                unique: false
            },
            description:{
                type: 'text',
                nullable: true
            },
            skill_id: {
            type: 'uuid',
            nullable: true
            },
            start_at:{
                type: 'timestamp',
                nullable: false
            },
            end_at:{
                type: 'timestamp',
                nullable: false
            },
            max_participants: {
                type: 'integer',
                nullable: false
            },
            meeting_url:{
                type: 'varchar',
                nullable: false
            },
        },
        relations: {
            skills:{
                type: 'many-to-one',
                target: 'Skill',
                joinColumn:{
                    name: 'skill_id',
                    referencedColumnName: 'id'
                },
            },
            coaches: {
                type: 'many-to-one',
                target: 'Coaches',
                joinColumn: {
                    name: 'coaches_id',
                    referencedColumnName: 'id'
                },
            }
        }
});

module.exports = Courses;