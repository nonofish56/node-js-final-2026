//router/courses

const express = require('express');

const router = express.Router();

const { getAllCourses } = require('../controllers/courses');

router.get('/',getAllCourses);



module.exports = router;