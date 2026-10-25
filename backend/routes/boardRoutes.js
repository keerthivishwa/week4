const express = require('express');
const router = express.Router();
const {
  getBoards,
  getBoardById,
  createBoard,
  updateBoard,
  deleteBoard,
  addMember,
} = require('../controllers/boardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All board routes require authentication

router.route('/').get(getBoards).post(createBoard);
router.route('/:id').get(getBoardById).put(updateBoard).delete(deleteBoard);
router.post('/:id/members', addMember);

module.exports = router;
