const { DataSource } = require('typeorm');

const Skill = require('./entities/Skill');
const Package = require('./entities/Package');
const Users = require('./entities/Users')
const Couches = require('./entities/Coaches');

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,

    entities: [
    Skill,
    Package,
    Users,
    Couches,
],
    synchronize: true,
});


module.exports = { dataSource };