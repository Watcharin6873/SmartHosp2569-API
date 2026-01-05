const express = require('express');
const router = express.Router();
const {
    uploadEvidenceFile,
    getEvidenceFiles,
    getListEvidence,
    removeEvidenceFile
} = require('../Controllers/UploadFile');
const {authCheck} = require('../Middleware/Auth');
const {uploadFile} = require('../Middleware/UploadEvidenceFile');

router.post('/uploadEvidenceFile', authCheck, uploadFile, uploadEvidenceFile);

router.get('/getEvidenceFiles', authCheck, getEvidenceFiles);

router.get('/getListEvidence', authCheck, getListEvidence);

router.delete('/removeEvidenceFile/:id', authCheck, removeEvidenceFile);


module.exports = router;