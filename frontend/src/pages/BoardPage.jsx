import React, { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useBoard } from '../context/BoardContext';
import { useAuth } from '../context/AuthContext';
import ListColumn from '../components/Board/ListColumn';
import AddListForm from '../components/Board/AddListForm';
import TaskCard from '../components/Task/TaskCard';

const BoardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentBoard, lists, tasks, loading, error, fetchBoard, setTasks, setLists, moveTaskOptimistic, reorderListsOptimistic } = useBoard();
  const { user } = useAuth();

  const [activeTask, setActiveTask] = React.useState(null);
  const [activeList, setActiveList] = React.useState(null);

  useEffect(() => {
    fetchBoard(id);
  }, [id, fetchBoard]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // ─── Drag Start ────────────────────────────────────────────────────────────
  const handleDragStart = useCallback(({ active }) => {
    const task = tasks.find((t) => t._id === active.id);
    if (task) { setActiveTask(task); return; }
    const list = lists.find((l) => l._id === active.id);
    if (list) setActiveList(list);
  }, [tasks, lists]);

  // ─── Drag End ──────────────────────────────────────────────────────────────
  const handleDragEnd = useCallback(({ active, over }) => {
    setActiveTask(null);
    setActiveList(null);

    if (!over || active.id === over.id) return;

    // ── Moving a task ──
    const draggedTask = tasks.find((t) => t._id === active.id);
    if (draggedTask) {
      // Determine destination list
      let destListId = over.id;
      const overTask = tasks.find((t) => t._id === over.id);
      if (overTask) destListId = overTask.list;

      // Build new tasks array
      const sameTasks = tasks.filter((t) => t.list === destListId && t._id !== draggedTask._id);
      const overIndex = overTask ? sameTasks.findIndex((t) => t._id === over.id) : sameTasks.length;

      const reordered = [...sameTasks];
      const movedTask = { ...draggedTask, list: destListId };
      reordered.splice(overIndex < 0 ? reordered.length : overIndex, 0, movedTask);

      const otherTasks = tasks.filter(
        (t) => t.list !== destListId && t._id !== draggedTask._id
      );

      const newTasks = [
        ...otherTasks,
        ...reordered.map((t, i) => ({ ...t, position: i })),
      ];

      moveTaskOptimistic(
        draggedTask._id,
        destListId,
        overIndex,
        currentBoard._id,
        newTasks
      );
      return;
    }

    // ── Moving a list ──
    const oldIndex = lists.findIndex((l) => l._id === active.id);
    const newIndex = lists.findIndex((l) => l._id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(lists, oldIndex, newIndex).map((l, i) => ({
        ...l,
        position: i,
      }));
      reorderListsOptimistic(reordered);
    }
  }, [tasks, lists, currentBoard, moveTaskOptimistic, reorderListsOptimistic]);

  // ─── Drag Over (cross-list preview) ────────────────────────────────────────
  const handleDragOver = useCallback(({ active, over }) => {
    if (!over) return;
    const draggedTask = tasks.find((t) => t._id === active.id);
    if (!draggedTask) return;

    const overTask = tasks.find((t) => t._id === over.id);
    const overList = lists.find((l) => l._id === over.id);
    const destListId = overTask?.list || overList?._id;

    if (!destListId || draggedTask.list === destListId) return;

    // Optimistic cross-list preview
    setTasks((prev) =>
      prev.map((t) => (t._id === draggedTask._id ? { ...t, list: destListId } : t))
    );
  }, [tasks, lists, setTasks]);

  if (loading && !currentBoard) {
    return (
      <div className="loading-page" role="status" aria-live="polite">
        <div className="spinner spinner-dark" aria-hidden="true"></div>
        <span>Loading board…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-page">
        <div className="alert alert-error">{error}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          ← Back to boards
        </button>
      </div>
    );
  }

  const boardStyle = {
    minHeight: 'calc(100vh - 56px)',
    background: `linear-gradient(135deg, ${currentBoard?.color || '#0052cc'}dd, ${currentBoard?.color || '#172b4d'}88), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  };

  return (
    <div style={boardStyle}>
      {/* Board Header */}
      <div className="board-page-header">
        <button
          className="btn btn-back btn-sm"
          onClick={() => navigate('/')}
          aria-label="Go back to boards"
        >
          ← Back
        </button>
        <h1>{currentBoard?.title}</h1>
        {currentBoard?.description && (
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
            {currentBoard.description}
          </span>
        )}
      </div>

      {/* Drag-and-drop board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="lists-container" role="region" aria-label="Board lists">
          {lists.map((list) => (
            <ListColumn
              key={list._id}
              list={list}
              tasks={tasks.filter((t) => t.list === list._id).sort((a, b) => a.position - b.position)}
              boardId={currentBoard?._id}
              boardMembers={currentBoard?.members}
            />
          ))}

          {/* Add new list */}
          <AddListForm boardId={currentBoard?._id} />
        </div>

        {/* Drag Overlay — ghost card while dragging */}
        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} isDragOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default BoardPage;
