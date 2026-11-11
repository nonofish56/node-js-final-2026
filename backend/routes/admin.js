//routes/admin.js
const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/verifyToken.js');

//將指定使用者升級為教練
const { upgradeUserToCoach } = require('../controllers/admin');

//取得教練本人的後台資料
const { getOneCoachData } = require('../controllers/admin');

//更新教練本人的後台資料
const { updateCoachData } = require('../controllers/admin.js');


router.post('/coaches/:userId',upgradeUserToCoach);
router.get('/coaches',verifyToken,getOneCoachData);
router.put('/coaches',verifyToken,updateCoachData);


module.exports = router;