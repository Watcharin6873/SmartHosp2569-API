const express = require('express');
const router = express.Router();
const {
    getListHospitals
} = require('../Controllers/Hospitals');
const {
    authCheck
} = require('../Middleware/Auth');

router.get('/getListHospitals', authCheck, getListHospitals);

module.exports = router