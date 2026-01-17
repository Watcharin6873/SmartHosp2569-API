const express = require('express');
const router = express.Router();
const { 
    createEvaluation,
    getDraftEvaluation, 
    getEvaluationById,
    getEvaluationByCatId,
    getListHospitalsInEvaluation
} = require('../Controllers/Evaluate');
const { authCheck } = require('../Middleware/Auth');


// Route to create Evaluation
router.post('/createEvaluation', authCheck, createEvaluation);

router.get('/getDraftEvaluation', authCheck, getDraftEvaluation);

router.get('/getEvaluationByCatId', authCheck, getEvaluationByCatId);

router.get('/getEvaluationById/:id', authCheck, getEvaluationById);

router.get('/getListHospitalsInEvaluation', authCheck, getListHospitalsInEvaluation);

module.exports = router;