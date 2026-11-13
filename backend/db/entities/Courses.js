const { EntitySchema, JoinColumn } = require('typeorm');

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