const express = require('express');
const router = express.Router();
const {
    getReportAllCat,
    getResultScoreAllCat,
    getReportAllCatByHcode9,
    getCyberLevelByHosp,
    getCyberLevel
} = require('../Controllers/Report');
const {authCheck} = require('../Middleware/Auth');

router.get('/getResultScoreAllCat', getResultScoreAllCat);

router.get('/getReportAllCat', authCheck, getReportAllCat);

router.get('/getReportAllCatByHcode9', authCheck, getReportAllCatByHcode9);

router.get('/getCyberLevelByHosp', authCheck, getCyberLevelByHosp);

router.get('/getCyberLevel', authCheck, getCyberLevel);

router.get('/getCyberLevelForDashboard', getCyberLevel);


module.exports = router;