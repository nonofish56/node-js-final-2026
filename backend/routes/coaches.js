//routes/coaches.js
const express = require('express');

const router = express.Router();

const { getSkills } = require('../controllers/coaches');

const { postSkills } = require('../controllers/coaches');

const { deleteSkills } = require('../controllers/coaches');

router.get('/skill',getSkills);
router.post('/skill',postSkills);
router.delete('/skill/:id',deleteSkills);


module.exports = router;