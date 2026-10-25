const asyncHandler = require('express-async-handler');
const Board = require('../models/Board');
const List = require('../models/List');
const Task = require('../models/Task');

// @desc    Get all boards for logged-in user
// @route   GET /api/boards
// @access  Private
const getBoards = asyncHandler(async (req, res) => {
  // User sees boards they own OR are a member of
  const boards = await Board.find({
    $or: [
      { owner: req.user._id },
      { 'members.user': req.user._id },
    ],
  }).populate('owner', 'name email');

  res.json(boards);
});

// @desc    Get single board with lists and tasks
// @route   GET /api/boards/:id
// @access  Private
const getBoardById = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id)
    .populate('owner', 'name email')
    .populate('members.user', 'name email role');

  if (!board) {
    res.status(404);
    throw new Error('Board not found');
  }

  // Check access
  const isOwner = board.owner._id.toString() === req.user._id.toString();
  const isMember = board.members.some(
    (m) => m.user._id.toString() === req.user._id.toString()
  );

  if (!isOwner && !isMember) {
    res.status(403);
    throw new Error('Not authorized to view this board');
  }

  // Fetch lists and tasks for this board
  const lists = await List.find({ board: board._id }).sort('position');
  const tasks = await Task.find({ board: board._id })
    .populate('assignedTo', 'name email')
    .sort('position');

  res.json({ board, lists, tasks });
});

// @desc    Create a new board
// @route   POST /api/boards
// @access  Private
const createBoard = asyncHandler(async (req, res) => {
  const { title, description, color } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Board title is required');
  }

  const board = await Board.create({
    title,
    description,
    color: color || '#0052cc',
    owner: req.user._id,
    members: [{ user: req.user._id, role: 'admin' }],
  });

  res.status(201).json(board);
});

// @desc    Update a board
// @route   PUT /api/boards/:id
// @access  Private (owner or board admin)
const updateBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);

  if (!board) {
    res.status(404);
    throw new Error('Board not found');
  }

  const isOwner = board.owner.toString() === req.user._id.toString();
  const isBoardAdmin = board.members.some(
    (m) => m.user.toString() === req.user._id.toString() && m.role === 'admin'
  );

  if (!isOwner && !isBoardAdmin) {
    res.status(403);
    throw new Error('Not authorized to update this board');
  }

  const { title, description, color } = req.body;
  if (title) board.title = title;
  if (description !== undefined) board.description = description;
  if (color) board.color = color;

  const updated = await board.save();
  res.json(updated);
});

// @desc    Delete a board and all its lists/tasks
// @route   DELETE /api/boards/:id
// @access  Private (owner only)
const deleteBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);

  if (!board) {
    res.status(404);
    throw new Error('Board not found');
  }

  if (board.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the board owner can delete it');
  }

  // Cascade delete lists and tasks
  await Task.deleteMany({ board: board._id });
  await List.deleteMany({ board: board._id });
  await board.deleteOne();

  res.json({ message: 'Board deleted successfully' });
});

// @desc    Add a member to a board
// @route   POST /api/boards/:id/members
// @access  Private (owner or board admin)
const addMember = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);

  if (!board) {
    res.status(404);
    throw new Error('Board not found');
  }

  const isOwner = board.owner.toString() === req.user._id.toString();
  const isBoardAdmin = board.members.some(
    (m) => m.user.toString() === req.user._id.toString() && m.role === 'admin'
  );

  if (!isOwner && !isBoardAdmin) {
    res.status(403);
    throw new Error('Not authorized to add members');
  }

  const { userId, role } = req.body;

  const alreadyMember = board.members.some(
    (m) => m.user.toString() === userId
  );
  if (alreadyMember) {
    res.status(400);
    throw new Error('User is already a member');
  }

  board.members.push({ user: userId, role: role || 'member' });
  await board.save();

  const updated = await Board.findById(board._id).populate(
    'members.user',
    'name email'
  );
  res.json(updated);
});

module.exports = {
  getBoards,
  getBoardById,
  createBoard,
  updateBoard,
  deleteBoard,
  addMember,
};
