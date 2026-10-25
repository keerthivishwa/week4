import React, { useState } from 'react';
import Modal from '../UI/Modal';
import { useBoard } from '../../context/BoardContext';

const LABELS = ['bug', 'feature', 'design', 'urgent', 'docs'];

const TaskDetailModal = ({ task, boardMembers = [], onClose }) => {
  const { updateTask, deleteTask } = useBoard();

  const [form, setForm] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    assignedTo: task.assignedTo?._id || '',
    labels: task.labels || [],
    completed: task.completed,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setSuccess(false);
  };

  const toggleLabel = (label) => {
    setForm((prev) => ({
      ...prev,
      labels: prev.labels.includes(label)
        ? prev.labels.filter((l) => l !== label)
        : [...prev.labels, label],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTask(task._id, {
        ...form,
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate || null,
      });
      setSuccess(true);
      setTimeout(onClose, 600);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete task "${task.title}"?`)) {
      await deleteTask(task._id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Task Details"
      size="task-detail-modal"
      footer={
        <>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>
            Delete
          </button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
            aria-busy={saving}
          >
            {saving ? <span className="spinner" aria-hidden="true"></span> : null}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </>
      }
    >
      {success && <div className="alert alert-success">Saved!</div>}

      <div className="form-group">
        <label htmlFor="task-title">Title</label>
        <input
          id="task-title"
          name="title"
          type="text"
          className="input"
          value={form.title}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="task-desc">Description</label>
        <textarea
          id="task-desc"
          name="description"
          className="input"
          value={form.description}
          onChange={handleChange}
          placeholder="Add a more detailed description…"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="form-group">
          <label htmlFor="task-priority">Priority</label>
          <select
            id="task-priority"
            name="priority"
            className="priority-select input"
            value={form.priority}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="task-due">Due date</label>
          <input
            id="task-due"
            name="dueDate"
            type="date"
            className="due-date-input input"
            value={form.dueDate}
            onChange={handleChange}
          />
        </div>
      </div>

      {boardMembers?.length > 0 && (
        <div className="form-group">
          <label htmlFor="task-assignee">Assigned to</label>
          <select
            id="task-assignee"
            name="assignedTo"
            className="assignee-select input"
            value={form.assignedTo}
            onChange={handleChange}
          >
            <option value="">Unassigned</option>
            {boardMembers.map((m) => (
              <option key={m.user._id} value={m.user._id}>
                {m.user.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label>Labels</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {LABELS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => toggleLabel(label)}
              aria-pressed={form.labels.includes(label)}
              style={{
                padding: '4px 12px',
                borderRadius: 20,
                border: `2px solid ${form.labels.includes(label) ? '#0052cc' : '#dfe1e6'}`,
                background: form.labels.includes(label) ? '#e6f0ff' : 'transparent',
                color: form.labels.includes(label) ? '#0052cc' : '#6b778c',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          id="task-completed"
          name="completed"
          type="checkbox"
          checked={form.completed}
          onChange={handleChange}
          style={{ width: 16, height: 16 }}
        />
        <label htmlFor="task-completed" style={{ marginBottom: 0, cursor: 'pointer' }}>
          Mark as completed
        </label>
      </div>
    </Modal>
  );
};

export default TaskDetailModal;
