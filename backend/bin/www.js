require('dotenv').config();

const app = require('../app');

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`伺服器已啟動：http://localhost:${port}`);
});