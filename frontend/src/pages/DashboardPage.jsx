import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBoard } from '../context/BoardContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/UI/Modal';

const BOARD_COLORS = [
  '#0052cc', '#36b37e', '#ff5630', '#ffab00',
  '#00b8d9', '#6554c0', '#172b4d', '#e91e63',
];

const DashboardPage = () => {
  const { boards, loading, error, fetchBoards, createBoard, deleteBoard } = useBoard();
  const { isAdmin, user } = useAuth();

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', color: BOARD_COLORS[0] });
  const [creating, setCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      await createBoard(form);
      setShowCreate(false);
      setForm({ title: '', description: '', color: BOARD_COLORS[0] });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteBoard(id);
    setDeleteConfirm(null);
  };

  if (loading && boards.length === 0) {
    return (
      <div className="loading-page" role="status" aria-live="polite">
        <div className="spinner spinner-dark" aria-hidden="true"></div>
        <span>Loading your boards…</span>
      </div>
    );
  }

  return (
    <main className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>My Boards</h1>
          <p>Welcome back, {user?.name}! Here are your project boards.</p>
        </div>
        {isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => setShowCreate(true)}
            aria-label="Create new board"
          >
            + New Board
          </button>
        )}
      </div>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      {boards.length === 0 && !loading ? (
        <div className="empty-state">
          <div className="icon" aria-hidden="true">📋</div>
          <h2>No boards yet</h2>
          <p>
            {isAdmin
              ? 'Create your first board to start organizing your work.'
              : 'You have not been added to any board yet. Ask an admin to invite you.'}
          </p>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              Create first board
            </button>
          )}
        </div>
      ) : (
        <div className="boards-grid">
          {boards.map((board) => (
            <div key={board._id} style={{ position: 'relative' }}>
              <Link to={`/board/${board._id}`} className="board-card" aria-label={`Open board: ${board.title}`}>
                <div
                  className="board-card-color-bar"
                  style={{ background: board.color }}
                  aria-hidden="true"
                />
                <div className="board-card-body">
                  <div className="board-card-title">{board.title}</div>
                  {board.description && (
                    <div className="board-card-desc">{board.description}</div>
                  )}
                </div>
                <div className="board-card-footer">
                  <span className="board-card-members">
                    👥 {board.members?.length || 1} member{board.members?.length !== 1 ? 's' : ''}
                  </span>
                  <span style={{ fontSize: 11, color: '#6b778c' }}>
                    {new Date(board.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
              {isAdmin && board.owner === user?._id || board.owner?._id === user?._id ? (
                <button
                  className="btn btn-danger btn-sm"
                  style={{ position: 'absolute', top: 14, right: 12 }}
                  onClick={(e) => { e.preventDefault(); setDeleteConfirm(board); }}
                  aria-label={`Delete board ${board.title}`}
                >
                  🗑
                </button>
              ) : null}
            </div>
          ))}

          {isAdmin && (
            <button
              className="board-card-new"
              onClick={() => setShowCreate(true)}
              aria-label="Create new board"
            >
              <span className="plus-icon" aria-hidden="true">+</span>
              <span>Create new board</span>
            </button>
          )}
        </div>
      )}

      {/* Create Board Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create New Board"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={handleCreate}
              disabled={creating || !form.title.trim()}
              aria-busy={creating}
            >
              {creating ? <span className="spinner" aria-hidden="true"></span> : null}
              Create Board
            </button>
          </>
        }
      >
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label htmlFor="board-title">Board title *</label>
            <input
              id="board-title"
              className="input"
              type="text"
              placeholder="e.g. Marketing Campaign Q1"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="board-desc">Description (optional)</label>
            <textarea
              id="board-desc"
              className="input"
              placeholder="What is this board for?"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Board color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {BOARD_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, color: c }))}
                  aria-label={`Select color ${c}`}
                  aria-pressed={form.color === c}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: c,
                    border: form.color === c ? '3px solid #172b4d' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'border var(--transition)',
                  }}
                />
              ))}
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Board"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm._id)}>
              Delete
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to delete <strong>{deleteConfirm?.title}</strong>?
          This will permanently remove all its lists and tasks.
        </p>
      </Modal>
    </main>
  );
};

export default DashboardPage;
