const express = require('express');
const router = express.Router();
const {
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  reorderTasks,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createTask);
router.put('/move', moveTask);
router.put('/reorder', reorderTasks);
router.route('/:id').put(updateTask).delete(deleteTask);

module.exports = router;
