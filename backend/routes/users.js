//routes/users.js
const express = require('express');

const router = express.Router();

//post
const { signupUsers } = require('../controllers/users')



router.post('/signup',signupUsers)
module.exports = router;