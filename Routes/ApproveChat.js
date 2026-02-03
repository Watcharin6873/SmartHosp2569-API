const express = require('express');
const router = express.Router();
const {
    getApproveChat,
    saveApproveChat
} = require('../Controllers/ApproveChat');
const { authCheck } = require('../Middleware/Auth');

router.get('/getApproveChat', authCheck, getApproveChat);

router.post('/saveApproveChat', authCheck, saveApproveChat);

module.exports = router