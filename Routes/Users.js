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

router.get('/getListUsers', authCheck, getListUsers)

router.put('/changeUserType',  authCheck, changeUserType)

router.put('/changeUserRole', authCheck, changeUserRole)

router.put('/changeUserStatus', authCheck, changeUserStatus)

router.delete('/deleteUser/:userId', authCheck, deleteUser)


module.exports = router;