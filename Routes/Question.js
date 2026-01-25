const express = require('express');
const router = express.Router();
const {
    createQuestion,
    getListQuestion,
    getQuestionById,
    getListQuestionByCatId,
    updateQuestion,
    deleteQuestion
} = require('../Controllers/Question');
const {
    authCheck,
    currentAdmin
} = require('../Middleware/Auth');

router.post('/createQuestion', authCheck, currentAdmin, createQuestion);

router.get('/getListQuestion',getListQuestion);

router.get('/getQuestionById/:id', authCheck, currentAdmin, getQuestionById);

router.get('/getListQuestionByCatId/:category_id', authCheck, getListQuestionByCatId);

router.put('/updateQuestion', authCheck, currentAdmin, updateQuestion);

router.delete('/deleteQuestion', authCheck, currentAdmin, deleteQuestion);


module.exports = router;