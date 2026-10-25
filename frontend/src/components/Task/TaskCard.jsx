import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskDetailModal from './TaskDetailModal';

const LABEL_COLORS = {
  bug: '#ff5630',
  feature: '#36b37e',
  design: '#6554c0',
  urgent: '#ffab00',
  docs: '#00b8d9',
};

const TaskCard = ({ task, boardMembers, isDragOverlay = false }) => {
  const [showDetail, setShowDetail] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: { type: 'task', task },
    disabled: isDragOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isOverdue =
    task.dueDate && !task.completed && new Date(task.dueDate) < new Date();

  const assigneeInitials = task.assignedTo?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`task-card ${isDragging ? 'dragging' : ''}`}
        role="article"
        aria-label={`Task: ${task.title}`}
      >
        {/* Labels */}
        {task.labels?.length > 0 && (
          <div className="task-card-labels" style={{ marginBottom: 6 }}>
            {task.labels.map((label) => (
              <div
                key={label}
                className="task-label"
                style={{ background: LABEL_COLORS[label] || '#dfe1e6' }}
                title={label}
                aria-label={`Label: ${label}`}
              />
            ))}
          </div>
        )}

        {/* Title */}
        <div
          className={`task-card-title ${task.completed ? 'completed' : ''}`}
          onClick={() => setShowDetail(true)}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') setShowDetail(true); }}
        >
          {task.title}
        </div>

        {/* Meta row */}
        <div className="task-card-meta">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className={`badge badge-${task.priority}`}>
              {task.priority}
            </span>

            {task.dueDate && (
              <span className={`task-due ${isOverdue ? 'overdue' : ''}`}>
                📅 {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {task.completed && (
              <span style={{ fontSize: 12, color: '#36b37e' }} title="Completed" aria-label="Completed">✓</span>
            )}
            {assigneeInitials && (
              <div className="task-assignee" title={task.assignedTo?.name} aria-label={`Assigned to ${task.assignedTo?.name}`}>
                {assigneeInitials}
              </div>
            )}
            {/* Drag handle */}
            <span
              {...attributes}
              {...listeners}
              style={{ cursor: 'grab', color: '#6b778c', fontSize: 12, padding: '0 2px' }}
              title="Drag to move"
              aria-label="Drag handle"
              role="button"
            >
              ⠿
            </span>
          </div>
        </div>
      </div>

      {/* Task detail modal */}
      {showDetail && (
        <TaskDetailModal
          task={task}
          boardMembers={boardMembers}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
};

export default TaskCard;
