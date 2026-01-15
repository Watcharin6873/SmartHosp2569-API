const express = require('express');
const router = express.Router();
const {
    uploadEvidenceFile,
    getEvidenceFiles,
    getListEvidence,
    removeEvidenceFile,
    // UploadFileBySubId
    uploadEvidenceBySubId,
    getListEvidenceByHcode9,
    removeEvidenceSubIdById
} = require('../Controllers/UploadFile');
const {authCheck} = require('../Middleware/Auth');
const {uploadFile} = require('../Middleware/UploadEvidenceFile');
const {uploadFileBySubId} = require('../Middleware/UploadEvidenceBySubId')

router.post('/uploadEvidenceFile', authCheck, uploadFile, uploadEvidenceFile);

router.get('/getEvidenceFiles', authCheck, getEvidenceFiles);

router.get('/getListEvidence', authCheck, getListEvidence);

router.delete('/removeEvidenceFile/:id', authCheck, removeEvidenceFile);

// UploadFileBySubId
router.post('/uploadEvidenceBySubId', authCheck, uploadFileBySubId, uploadEvidenceBySubId);

router.get('/getListEvidenceByHcode9', authCheck, getListEvidenceByHcode9)

router.delete('/removeEvidenceSubIdById/:id', authCheck, removeEvidenceSubIdById)


module.exports = router;