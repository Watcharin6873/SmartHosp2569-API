const express = require('express');
const router = express.Router();
const {
    provApproveEvaluation,
    provUpdateApproveEvaluation,
    getProvApproveEvaluation,
    getProvAndZoneApprove,
    zoneApproveEvaluation
} = require('../Controllers/Approve');
const { authCheck } = require('../Middleware/Auth');

router.post('/provApproveEvaluation', authCheck, provApproveEvaluation);

router.put('/provUpdateApproveEvaluation', authCheck, provUpdateApproveEvaluation);

router.put('/zoneApproveEvaluation', authCheck, zoneApproveEvaluation);

router.get('/getProvApproveEvaluation', authCheck, getProvApproveEvaluation);

router.get('/getProvAndZoneApprove', authCheck, getProvAndZoneApprove);


module.exports = router