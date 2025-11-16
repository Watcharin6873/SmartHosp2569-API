const express = require('express');
const router = express.Router();
const {
    createSubQuestion,
    getListSubQuestion,
    getSubQuestionById,
    updateSubQuestion,
    deleteSubQuestion
} = require('../Controllers/SubQuestion');
const {authCheck, currentAdmin} = require('../Middleware/Auth');

router.post('/createSubQuestion', authCheck, currentAdmin, createSubQuestion);

router.get('/getListSubQuestion', authCheck, getListSubQuestion);

router.get('/getSubQuestionById/:id', authCheck, currentAdmin, getSubQuestionById);

router.put('/updateSubQuestion', authCheck, currentAdmin, updateSubQuestion);

router.delete('/deleteSubQuestion', authCheck, currentAdmin, deleteSubQuestion);


module.exports = router;