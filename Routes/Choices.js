const express = require('express');
const router = express.Router();
const {
    createChoice,
    getListChoices,
    getChoiceById,
    getListChoicesByCatId,
    getListChoicesBySubQuestionId,
    updateChoice,
    deleteChoice
} = require('../Controllers/Choices');
const {authCheck, currentAdmin} = require('../Middleware/Auth');

router.post('/createChoice', authCheck, currentAdmin, createChoice);

router.get('/getListChoices', authCheck, getListChoices);

router.get('/getListChoicesByCatId', authCheck, getListChoicesByCatId);

router.get('/getChoiceById/:id', authCheck, currentAdmin, getChoiceById);

router.get('/getListChoicesBySubQuestionId/:sub_question_id', authCheck, getListChoicesBySubQuestionId);

router.put('/updateChoice', authCheck, currentAdmin, updateChoice);

router.delete('/deleteChoice/:id', authCheck, currentAdmin, deleteChoice);


module.exports = router;