//routes/users.js
const express = require('express');
const verifyToken = require('../middleware/verifyToken.js');

const router = express.Router();

//post註冊會員
const { signupUsers } = require('../controllers/users')

//post登錄會員
const { loginUsers } = require('../controllers/users')

//get取得個人資料
const { getUsersProfile } = require('../controllers/users.js')

//put 更新本人的暱稱
const { updateUsersProfile } = require('../controllers/users')

//put修改本人的登錄密碼
const { updateUsersPassword } = require('../controllers/users.js')



router.post('/signup',signupUsers)
router.post('/login',loginUsers)
router.get('/profile',verifyToken,getUsersProfile)
router.put('/profile',verifyToken,updateUsersProfile);
router.put('/password',verifyToken,updateUsersPassword);



module.exports = router;