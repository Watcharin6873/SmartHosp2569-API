const express = require('express');
const router = express.Router();
const {
    provApproveEvaluation,
    provUpdateApproveEvaluation,
    getProvApproveEvaluation,
    getProvAndZoneApprove
} = require('../Controllers/Approve');
const { authCheck } = require('../Middleware/Auth');

router.post('/provApproveEvaluation', authCheck, provApproveEvaluation);

router.put('/provUpdateApproveEvaluation', authCheck, provUpdateApproveEvaluation);

router.get('/getProvApproveEvaluation', authCheck, getProvApproveEvaluation);

router.get('/getProvAndZoneApprove', authCheck, getProvAndZoneApprove);


module.exports = router