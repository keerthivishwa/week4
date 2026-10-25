import React, { useState, useRef, useEffect } from 'react';
import { useBoard } from '../../context/BoardContext';

const AddTaskForm = ({ listId, boardId, onClose }) => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);
  const { createTask } = useBoard();

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await createTask({ title: title.trim(), listId, boardId });
      setTitle('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-task-form">
      <form onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          placeholder="Enter a title for this card…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          aria-label="New task title"
          maxLength={200}
        />
        <div className="add-task-form-actions">
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={!title.trim() || loading}
            aria-busy={loading}
          >
            {loading ? 'Adding…' : 'Add card'}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTaskForm;
