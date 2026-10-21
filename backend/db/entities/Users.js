const { EntitySchema } = require('typeorm');

const Users = new EntitySchema({
    name: "Users",
    tableName: "users",

    columns: {
        id:{
            type: "uuid",
            primary: true,
            generated: "uuid"
        },
        name: {
            type: "varchar",
            length: 50,
            nullable: false
        },
        email: {
            type: "varchar",
            nullable: false,
            unique: true
        },
        password: {
            type: "text",
            nullable: false
        },
        role: {
            type: "text",
            nullable: false,
            default: "USER"
        }
    }
})

module.exports= Users;