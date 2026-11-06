const express = require('express');
const router = express.Router();
const { getAllLoans, getLoanById, createLoan } = require('../controllers/loanController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', getAllLoans);
router.get('/:id', getLoanById);
router.post('/', createLoan);

module.exports = router;
