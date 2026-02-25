const express = require('express');
const router = express.Router();
const {
    exportToExcelMulti,
    exportToExcelMulti_v2
} = require('../Controllers/ExportExcel');
const {
    authCheck,
} = require('../Middleware/Auth');

router.get('/exportToExcelMulti', authCheck, exportToExcelMulti);

router.post('/exportToExcelMulti_v2', authCheck, exportToExcelMulti_v2);


module.exports = router;