const express = require('express');

const router = express.Router();
const verifyToken = require('../middleware/verifyToken.js')

const { getPackage } = require('../controllers/credit.js');

const { postPackage } = require('../controllers/credit.js');

const { deletePackage } = require('../controllers/credit.js');

const { postCreditPackageById } = require('../controllers/credit.js');



router.post('/:creditPackageId',verifyToken,postCreditPackageById);

router.get('/',getPackage);
router.post('/',postPackage);
router.delete('/:creditPackageId',deletePackage);





module.exports = router;