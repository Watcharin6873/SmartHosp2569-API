const express = require('express');
const router = express.Router();
const {
    exportToExcelMulti,
    exportToExcelMulti_v2,
    exportToExcelMulti_v3
} = require('../Controllers/ExportExcel');
const {
    authCheck,
} = require('../Middleware/Auth');

router.get('/exportToExcelMulti', authCheck, exportToExcelMulti);

router.post('/exportToExcelMulti_v2', authCheck, exportToExcelMulti_v2);

router.post('/exportToExcelMulti_v3', authCheck, exportToExcelMulti_v3);


module.exports = router;