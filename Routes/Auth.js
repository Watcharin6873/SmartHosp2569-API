const express = require('express');
const router = express.Router();
const {
    exchangeToken,
    registerWithProviderID,
    loginWithProviderId,
    checkStatusAccount,
    loginSmartHosp,
    currentUser,
    verifyToken,
    signout
} = require('../Controllers/Auth')
const {
    authCheck,
    currentAdmin
} = require('../Middleware/Auth');

router.post('/exchangeToken', exchangeToken);

router.post('/checkStatusAccount', checkStatusAccount);

router.post('/loginSmartHosp', loginSmartHosp);

router.post('/currentUser', authCheck, currentUser);

router.post('/currentAdmin', authCheck, currentAdmin, currentUser);

router.get('/verifyToken', authCheck, verifyToken);

router.post('/signout', signout);


module.exports = router;