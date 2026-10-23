//routes/users.js
const express = require('express');

const router = express.Router();

//post註冊會員
const { signupUsers } = require('../controllers/users')

//post登錄會員
const { loginUsers } = require('../controllers/users')



router.post('/signup',signupUsers)
router.post('/login',loginUsers)



module.exports = router;