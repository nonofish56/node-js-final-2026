//routes/coaches.js
const express = require('express');

const router = express.Router();

const { getSkills } = require('../controllers/coaches');

const { postSkills } = require('../controllers/coaches');

const { deleteSkills } = require('../controllers/coaches');

const { getCoachPage } = require('../controllers/coaches');

const { getCoachById } = require('../controllers/coaches');


router.get('/skill',getSkills);
router.post('/skill',postSkills);
router.delete('/skill/:id',deleteSkills);

router.get('/',getCoachPage);
router.get('/:coachId',getCoachById);


module.exports = router;