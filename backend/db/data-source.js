const { DataSource } = require('typeorm');

const Skill = require('./entities/Skill');
const Package = require('./entities/Package');

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
],
    synchronize: true,
});


module.exports = { dataSource };