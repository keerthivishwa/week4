import React, { useState, useRef, useEffect } from 'react';
import { useBoard } from '../../context/BoardContext';

const AddListForm = ({ boardId }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const { createList } = useBoard();

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await createList(title.trim(), boardId);
      setTitle('');
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <div className="add-list-card">
        <button
          className="add-list-btn"
          onClick={() => setOpen(true)}
          aria-label="Add new list"
        >
          + Add another list
        </button>
      </div>
    );
  }

  return (
    <div className="add-list-card">
      <form className="add-list-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter list title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
          aria-label="New list title"
          maxLength={80}
        />
        <div className="add-list-form-actions">
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={!title.trim() || loading}
            aria-busy={loading}
          >
            {loading ? 'Adding…' : 'Add list'}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => { setOpen(false); setTitle(''); }}
          >
            ✕
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddListForm;
