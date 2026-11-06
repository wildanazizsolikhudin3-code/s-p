const express = require('express');
const router = express.Router();
const { processReturn, getPendingReturns } = require('../controllers/returnController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/pending', getPendingReturns);
router.post('/', processReturn);

module.exports = router;
