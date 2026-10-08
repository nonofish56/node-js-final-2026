const dotenv = require('dotenv');
dotenv.config();

const app = require('../app.js');
const { dataSource } = require('../db/data-source.js')

async function main() {
    await dataSource.initialize();
    console.log("資料庫連線成功");
    app.listen(process.env.PORT || 8080);
}

main();