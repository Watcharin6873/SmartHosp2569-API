const express = require('express');
const router = express.Router();
const {
    createCategory,
    getListCategory,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require('../Controllers/Category');
const { authCheck, currentAdmin } = require('../Middleware/Auth');

router.post('/createCategory', authCheck, currentAdmin, createCategory);

router.get('/getListCategory', authCheck, currentAdmin, getListCategory);

router.get('/getCategoryById/:id', authCheck, currentAdmin, getCategoryById);

router.put('/updateCategory', authCheck, currentAdmin, updateCategory);

router.delete('/deleteCategory', authCheck, currentAdmin, deleteCategory);


module.exports = router;