const asyncHandler = require('express-async-handler');
const List = require('../models/List');
const Task = require('../models/Task');
const Board = require('../models/Board');

// Helper: verify user has access to the board
const checkBoardAccess = async (boardId, userId) => {
  const board = await Board.findById(boardId);
  if (!board) return null;

  const isOwner = board.owner.toString() === userId.toString();
  const isMember = board.members.some(
    (m) => m.user.toString() === userId.toString()
  );

  return isOwner || isMember ? board : null;
};

// @desc    Create a list in a board
// @route   POST /api/lists
// @access  Private
const createList = asyncHandler(async (req, res) => {
  const { title, boardId } = req.body;

  if (!title || !boardId) {
    res.status(400);
    throw new Error('Title and boardId are required');
  }

  const board = await checkBoardAccess(boardId, req.user._id);
  if (!board) {
    res.status(403);
    throw new Error('Not authorized or board not found');
  }

  const count = await List.countDocuments({ board: boardId });

  const list = await List.create({
    title,
    board: boardId,
    position: count,
  });

  res.status(201).json(list);
});

// @desc    Update a list title
// @route   PUT /api/lists/:id
// @access  Private
const updateList = asyncHandler(async (req, res) => {
  const list = await List.findById(req.params.id);

  if (!list) {
    res.status(404);
    throw new Error('List not found');
  }

  const board = await checkBoardAccess(list.board, req.user._id);
  if (!board) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const { title } = req.body;
  if (title) list.title = title;

  const updated = await list.save();
  res.json(updated);
});

// @desc    Delete a list and its tasks
// @route   DELETE /api/lists/:id
// @access  Private
const deleteList = asyncHandler(async (req, res) => {
  const list = await List.findById(req.params.id);

  if (!list) {
    res.status(404);
    throw new Error('List not found');
  }

  const board = await checkBoardAccess(list.board, req.user._id);
  if (!board) {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Cascade delete tasks in this list
  await Task.deleteMany({ list: list._id });
  await list.deleteOne();

  res.json({ message: 'List deleted' });
});

// @desc    Reorder lists in a board (drag-and-drop)
// @route   PUT /api/lists/reorder
// @access  Private
const reorderLists = asyncHandler(async (req, res) => {
  const { boardId, orderedListIds } = req.body;

  const board = await checkBoardAccess(boardId, req.user._id);
  if (!board) {
    res.status(403);
    throw new Error('Not authorized or board not found');
  }

  const updates = orderedListIds.map((id, index) =>
    List.findByIdAndUpdate(id, { position: index }, { new: true })
  );

  await Promise.all(updates);
  res.json({ message: 'Lists reordered' });
});

module.exports = { createList, updateList, deleteList, reorderLists };
