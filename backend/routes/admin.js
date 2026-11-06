//routes/admin.js
const express = require('express');
const router = express.Router();

const { upgradeUserToCoach } = require('../controllers/admin')



router.post('/coaches/:userId',upgradeUserToCoach);


module.exports = router;