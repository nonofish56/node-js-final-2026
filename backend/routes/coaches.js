//routes/coaches.js
const express = require('express');

const router = express.Router();

const { getSkills } = require('../controllers/coaches');

const { postSkills } = require('../controllers/coaches');

router.get('/skill',getSkills);

router.post('/skill',postSkills);


module.exports = router;