const express = require('express');
const multer = require('multer');
const path = require('path');

// Set Storage Engine
const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, 'evidence_subid/');
    },
    filename: (req, file, cb) =>{
        const uniqueSuffix = Date.now()
        cb(null, 'EVSUBID_' + uniqueSuffix+'_' + file.originalname)
    }
});

const MAX_FILE_SIZE = 15 * 1024 * 1024;  // 15 MB

// filter เฉพาะ pdf
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('รองรับเฉพาะไฟล์ PDF!'), false);
    }
};

// จำกัดขนาดไฟล์ 15 MB
exports.uploadFileBySubId = multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: fileFilter
}).single('ev_filename');
