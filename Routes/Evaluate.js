const express = require('express');
const router = express.Router();
const { 
    createEvaluation_v2,
    createEvaluation_v3,
    getDraftEvaluation, 
    getEvaluationById,
    getEvaluationByCatId,
    getListHospitalsInEvaluation,
    getListHospitalsInEvaluation2,
    requestForEditEvaluation,
    getScoreHospitalForSubQuestion,
    getScoreHospitalForSubQuestion2
} = require('../Controllers/Evaluate');
const { authCheck } = require('../Middleware/Auth');


// Route to create Evaluation
router.post('/createEvaluation', authCheck, createEvaluation_v3);

router.get('/getDraftEvaluation', authCheck, getDraftEvaluation);

router.get('/getEvaluationByCatId', authCheck, getEvaluationByCatId);

router.get('/getEvaluationById/:id', authCheck, getEvaluationById);

router.get('/getListHospitalsInEvaluation', authCheck, getListHospitalsInEvaluation);

router.get('/getListHospitalsInEvaluation2', authCheck, getListHospitalsInEvaluation2);

router.get('/getScoreHospitalForSubQuestion', authCheck, getScoreHospitalForSubQuestion);

router.get('/getScoreHospitalForSubQuestion2', authCheck, getScoreHospitalForSubQuestion2);

router.put('/requestForEditEvaluation', authCheck, requestForEditEvaluation);

module.exports = router;