const express = require('express');
const router = express.Router();
const {
    getReportAllCat,
    getReportAllCatByHcode9,
    getCyberLevelByHosp,
    getCyberLevel
} = require('../Controllers/Report');
const {authCheck} = require('../Middleware/Auth');

router.get('/getReportAllCat', authCheck, getReportAllCat);

router.get('/getReportAllCatByHcode9', authCheck, getReportAllCatByHcode9);

router.get('/getCyberLevelByHosp', authCheck, getCyberLevelByHosp);

router.get('/getCyberLevel', authCheck, getCyberLevel);


module.exports = router;