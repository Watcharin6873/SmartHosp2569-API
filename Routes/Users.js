const express = require('express');
const router = express.Router();

const {
    saveRegister
} = require('../Controllers/Users');

router.post('/saveRegister', saveRegister)


module.exports = router;