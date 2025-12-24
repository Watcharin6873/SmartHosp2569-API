const express = require('express');
const router = express.Router();
const {
    uploadEvidenceFile,
    getEvidenceFiles
} = require('../Controllers/UploadFile');
const {authCheck} = require('../Middleware/Auth');
const {uploadFile} = require('../Middleware/UploadEvidenceFile');

router.post('/uploadEvidenceFile', authCheck, uploadFile, uploadEvidenceFile);

router.post('/getEvidenceFiles', authCheck, getEvidenceFiles);


module.exports = router;