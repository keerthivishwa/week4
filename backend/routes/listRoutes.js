const express = require('express');
const router = express.Router();
const { createList, updateList, deleteList, reorderLists } = require('../controllers/listController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createList);
router.put('/reorder', reorderLists);
router.route('/:id').put(updateList).delete(deleteList);

module.exports = router;
