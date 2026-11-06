const express = require('express');
const router = express.Router();
const { getAllBooks, getBookById, createBook, updateBook, deleteBook } = require('../controllers/bookController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.use(authMiddleware);

router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.post('/', upload.single('cover_image'), createBook);
router.put('/:id', upload.single('cover_image'), updateBook);
router.delete('/:id', deleteBook);

module.exports = router;
