const express = require('express');
const router = express.Router();
const {
    exportToExcelMulti,
    exportToExcelMulti_v4,
    testQueryDataFromProvApprove,
    queryResultForexportExcel,
    queryForTemplateExcelExport
} = require('../Controllers/ExportExcel');
const {
    authCheck,
} = require('../Middleware/Auth');

router.get('/exportToExcelMulti', authCheck, exportToExcelMulti);

router.get('/testQueryDataFromProvApprove', testQueryDataFromProvApprove);

router.post('/exportToExcelMulti_v4', authCheck, exportToExcelMulti_v4);

router.get('/queryResultForexportExcel', queryResultForexportExcel);

router.get('/queryForTemplateExcelExport', queryForTemplateExcelExport);


module.exports = router;