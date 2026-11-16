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

//取得教練本人開設的全部課程列表
const { getCoachCourses } = require('../controllers/admin.js')

//教練開課新課程
const { postNewCourses } = require('../controllers/admin.js')

//取得單一課程詳情
const { getCoachCourseById } = require('../controllers/admin.js')


router.post('/coaches/courses', verifyToken, postNewCourses);

router.get('/coaches/courses/:courseId',verifyToken,getCoachCourseById);

router.post('/coaches/:userId', upgradeUserToCoach);

router.get('/coaches', verifyToken, getOneCoachData);
router.put('/coaches', verifyToken, updateCoachData);
router.get('/coaches/courses', verifyToken, getCoachCourses);


module.exports = router;