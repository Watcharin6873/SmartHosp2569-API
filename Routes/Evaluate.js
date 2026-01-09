const express = require('express');
const router = express.Router();
const { 
    createEvaluation,
    getDraftEvaluation, 
} = require('../Controllers/Evaluate');
const { authCheck } = require('../Middleware/Auth');


// Route to create Evaluation
router.post('/createEvaluation', authCheck, createEvaluation);

router.get('/getDraftEvaluation', authCheck, getDraftEvaluation);

module.exports = router;