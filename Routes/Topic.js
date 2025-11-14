const express = require('express');
const router = express.Router();
const {
    createTopic,
    getListTopic,
    getTopicById,
    updateTopic,
    deleteTopic,
    changeStatusTopic
} = require('../Controllers/Topic');
const {
    authCheck,
    currentAdmin
} = require('../Middleware/Auth');


router.post('/createTopic', authCheck, currentAdmin, createTopic);

router.get('/getListTopic', authCheck, currentAdmin, getListTopic);

router.get('/getTopicById/:id', authCheck, currentAdmin, getTopicById);

router.put('/updateTopic', authCheck, currentAdmin, updateTopic);

router.put('/changeStatusTopic', authCheck, currentAdmin, changeStatusTopic);

router.delete('/deleteTopic/:id', authCheck, currentAdmin, deleteTopic);


module.exports = router;