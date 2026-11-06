const express = require('express');
const router = express.Router();
const { getDashboardStats, getBookReport, getMemberReport, getTransactionReport } = require('../controllers/reportController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/dashboard', getDashboardStats);
router.get('/books', getBookReport);
router.get('/members', getMemberReport);
router.get('/transactions', getTransactionReport);

module.exports = router;
