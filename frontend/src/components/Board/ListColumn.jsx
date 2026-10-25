import React, { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from '../Task/TaskCard';
import AddTaskForm from '../Task/AddTaskForm';
import { useBoard } from '../../context/BoardContext';

const ListColumn = ({ list, tasks, boardId, boardMembers }) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(list.title);
  const [showAddTask, setShowAddTask] = useState(false);
  const titleInputRef = useRef(null);

  const { updateList, deleteList } = useBoard();

  // Make the entire list column sortable (for reordering lists)
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list._id, data: { type: 'list' } });

  // Also make it a droppable for tasks
  const { setNodeRef: setDropRef } = useDroppable({ id: list._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  const handleTitleSave = async () => {
    setEditingTitle(false);
    if (titleValue.trim() && titleValue !== list.title) {
      await updateList(list._id, titleValue.trim());
    } else {
      setTitleValue(list.title);
    }
  };

  const handleDeleteList = async () => {
    if (window.confirm(`Delete list "${list.title}" and all its tasks?`)) {
      await deleteList(list._id);
    }
  };

  // Combine refs
  const setRef = (node) => {
    setSortableRef(node);
    setDropRef(node);
  };

  return (
    <div
      ref={setRef}
      className="list-column"
      style={style}
      role="region"
      aria-label={`List: ${list.title}`}
    >
      {/* List Header */}
      <div className="list-header">
        {editingTitle ? (
          <input
            ref={titleInputRef}
            className="list-title-input"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSave();
              if (e.key === 'Escape') { setEditingTitle(false); setTitleValue(list.title); }
            }}
            aria-label={`Edit list title: ${list.title}`}
          />
        ) : (
          <span
            className="list-title"
            onClick={() => setEditingTitle(true)}
            {...attributes}
            {...listeners}
            title="Click to rename, drag to reorder"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') setEditingTitle(true); }}
          >
            {list.title}
            <span style={{ marginLeft: 6, fontSize: 12, color: '#6b778c' }}>
              ({tasks.length})
            </span>
          </span>
        )}

        <button
          className="btn btn-ghost btn-icon btn-sm"
          onClick={handleDeleteList}
          aria-label={`Delete list ${list.title}`}
          title="Delete list"
          style={{ fontSize: 14 }}
        >
          ✕
        </button>
      </div>

      {/* Tasks */}
      <div className="list-tasks">
        <SortableContext
          items={tasks.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              boardMembers={boardMembers}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add Task */}
      <div className="list-footer">
        {showAddTask ? (
          <AddTaskForm
            listId={list._id}
            boardId={boardId}
            onClose={() => setShowAddTask(false)}
          />
        ) : (
          <button
            className="add-task-btn"
            onClick={() => setShowAddTask(true)}
            aria-label={`Add task to ${list.title}`}
          >
            + Add a card
          </button>
        )}
      </div>
    </div>
  );
};

export default ListColumn;
