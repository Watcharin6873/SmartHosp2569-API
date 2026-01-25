const express = require('express');
const router = express.Router();
const {
    getMyChatRoom,
    getMessages,
    sendMessages
} = require('../Controllers/ChatSystem');
const {
    checkChatRoomAccess
} = require('../Middleware/CheckChatRoomAccess');
const {
    authCheck
} = require('../Middleware/Auth');

router.get('/getMyChatRoom', authCheck, getMyChatRoom);

router.get('/getMessages/:roomId', authCheck,checkChatRoomAccess, getMessages);

router.post('/sendMessages', authCheck, checkChatRoomAccess, sendMessages);


module.exports = router;