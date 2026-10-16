const express = require('express');

const router = express.Router();

const { getPackage } = require('../controllers/credit.js')

const { postPackage } = require('../controllers/credit.js')



router.get('/',getPackage);
router.post('/',postPackage);
module.exports = router;