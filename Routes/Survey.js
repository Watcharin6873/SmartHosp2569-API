const express = require('express');
const router = express.Router();
const {
    createSurveyScore,
    getListSurveyScore,
    saveSurveyForm,
    saveSurveyComment,
    searchAVGSurvey,
    getSurveyFormById,
    updateScoreSurvey
} = require('../Controllers/Survey')
const {authCheck,currentAdmin} = require('../Middleware/Auth');

router.post('/createSurveyScore',authCheck, currentAdmin, createSurveyScore);

router.get('/getListSurveyScore', getListSurveyScore);

router.post('/saveSurveyForm', saveSurveyForm);

router.post('/saveSurveyComment', saveSurveyComment);

router.get('/searchAVGSurvey', searchAVGSurvey);

router.get('/getSurveyFormById/:id',authCheck, currentAdmin, getSurveyFormById);

router.put('/updateScoreSurvey', authCheck, currentAdmin, updateScoreSurvey);


module.exports = router;