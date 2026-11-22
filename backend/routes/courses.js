//router/courses

const express = require('express');
const verifyToken  = require('../middleware/verifyToken');
const router = express.Router();

const { getAllCourses } = require('../controllers/courses');
const { postCourseId } = require('../controllers/courses');
const { updateCourseById } = require('../controllers/courses');


router.get('/',getAllCourses);
router.post('/:courseId',verifyToken,postCourseId);
router.delete('/:courseId',verifyToken,updateCourseById);

module.exports = router;