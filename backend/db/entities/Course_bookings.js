const { EntitySchema } = require('typeorm');

const courseBookings = new EntitySchema({
        name: 'CoursesBookings',
        tableName: 'course_bookings',

    columns: {
        id:{
            type:'uuid',
            primary: true,
            generated: 'uuid'
        },
    },
    relations: {
        users:{
            type: 'many-to-one',
            target: 'Users',
            joinColumn:{
                name: 'user_id',
                referencedColumnName:
                    'id'
                },
            },
        courses:{
            type: 'many-to-one',
            target: 'Courses',
            joinColumn:{
                name: 'course_id',
                referencedColumnName:
                    'id'
            },
        },
}});

module.exports = courseBookings;