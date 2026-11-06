const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
