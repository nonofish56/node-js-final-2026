const { EntitySchema } = require('typeorm');

const coaches = new EntitySchema({
    name: 'Coaches',
    tableName: 'coaches',

    columns: {
        id: {
            type: 'uuid',
            primary: true,
            generated: 'uuid'
        },
        user_id: {
            type: 'uuid',
            unique: true,
            nullable: false
        },
        experience_years: {
            type: 'integer',
            nullable: false
        },
        description: {
            type: 'text',
            nullable: false
        },
        profile_image_url: {
            type: 'text',
            nullable: true
        },
        created_at: {
            type: 'timestamptz',
            createDate: true
        },
        updated_at: {
            type: 'timestamptz',
            updateDate: true
        },   
    },
        checks: [{
            name: 'CHK_coaches_experience_years',
            expression: '"experience_years" >= 0'
        },
    ],
        relations: {
            user:{
                type: 'one-to-one',
                target: 'Users',
                joinColumn: {
                    name: 'user_id',
                    referencedColumnName: 'id'
                },
            },
        },
});
module.exports = coaches;