const express = require('express');
const router = express.Router();

const {
    saveRegister,
    getListUsers,
    changeUserType,
    changeUserRole,
    changeUserStatus,
    deleteUser
} = require('../Controllers/Users');
const {
    authCheck,
    currentAdmin
} = require('../Middleware/Auth');

router.post('/saveRegister', saveRegister)

router.get('/getListUsers', authCheck, currentAdmin, getListUsers)

router.put('/changeUserType',  authCheck, currentAdmin, changeUserType)

router.put('/changeUserRole', authCheck, currentAdmin, changeUserRole)

router.put('/changeUserStatus', authCheck, currentAdmin, changeUserStatus)

router.delete('/deleteUser/:userId', authCheck, currentAdmin, deleteUser)


module.exports = router;