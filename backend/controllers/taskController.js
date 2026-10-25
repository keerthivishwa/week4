const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const List = require('../models/List');
const Board = require('../models/Board');

// Helper: verify board access
const checkBoardAccess = async (boardId, userId) => {
  const board = await Board.findById(boardId);
  if (!board) return null;
  const isOwner = board.owner.toString() === userId.toString();
  const isMember = board.members.some(
    (m) => m.user.toString() === userId.toString()
  );
  return isOwner || isMember ? board : null;
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, listId, boardId, priority, dueDate, assignedTo, labels } =
    req.body;

  if (!title || !listId || !boardId) {
    res.status(400);
    throw new Error('Title, listId, and boardId are required');
  }

  const board = await checkBoardAccess(boardId, req.user._id);
  if (!board) {
    res.status(403);
    throw new Error('Not authorized or board not found');
  }

  const count = await Task.countDocuments({ list: listId });

  const task = await Task.create({
    title,
    description,
    list: listId,
    board: boardId,
    position: count,
    priority: priority || 'medium',
    dueDate: dueDate || null,
    assignedTo: assignedTo || null,
    labels: labels || [],
  });

  const populated = await task.populate('assignedTo', 'name email');
  res.status(201).json(populated);
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const board = await checkBoardAccess(task.board, req.user._id);
  if (!board) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const { title, description, priority, dueDate, assignedTo, labels, completed } =
    req.body;

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (assignedTo !== undefined) task.assignedTo = assignedTo;
  if (labels !== undefined) task.labels = labels;
  if (completed !== undefined) task.completed = completed;

  const updated = await task.save();
  const populated = await updated.populate('assignedTo', 'name email');
  res.json(populated);
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const board = await checkBoardAccess(task.board, req.user._id);
  if (!board) {
    res.status(403);
    throw new Error('Not authorized');
  }

  await task.deleteOne();
  res.json({ message: 'Task deleted' });
});

// @desc    Move task to different list or reorder (drag-and-drop)
// @route   PUT /api/tasks/move
// @access  Private
const moveTask = asyncHandler(async (req, res) => {
  const { taskId, destinationListId, newPosition, boardId } = req.body;

  const board = await checkBoardAccess(boardId, req.user._id);
  if (!board) {
    res.status(403);
    throw new Error('Not authorized or board not found');
  }

  const task = await Task.findById(taskId);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  task.list = destinationListId;
  task.position = newPosition;
  await task.save();

  res.json({ message: 'Task moved', task });
});

// @desc    Bulk reorder tasks within a list
// @route   PUT /api/tasks/reorder
// @access  Private
const reorderTasks = asyncHandler(async (req, res) => {
  const { boardId, listId, orderedTaskIds } = req.body;

  const board = await checkBoardAccess(boardId, req.user._id);
  if (!board) {
    res.status(403);
    throw new Error('Not authorized or board not found');
  }

  const updates = orderedTaskIds.map((id, index) =>
    Task.findByIdAndUpdate(id, { position: index, list: listId }, { new: true })
  );

  await Promise.all(updates);
  res.json({ message: 'Tasks reordered' });
});

module.exports = { createTask, updateTask, deleteTask, moveTask, reorderTasks };
