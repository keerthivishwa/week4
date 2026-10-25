import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

const BoardContext = createContext(null);

export const BoardProvider = ({ children }) => {
  const [boards, setBoards] = useState([]);
  const [currentBoard, setCurrentBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ─── Boards ────────────────────────────────────────────────────────────────

  const fetchBoards = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/boards');
      setBoards(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch boards');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBoard = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/boards/${id}`);
      setCurrentBoard(data.board);
      setLists(data.lists.sort((a, b) => a.position - b.position));
      setTasks(data.tasks.sort((a, b) => a.position - b.position));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch board');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBoard = useCallback(async (boardData) => {
    const { data } = await api.post('/boards', boardData);
    setBoards((prev) => [data, ...prev]);
    return data;
  }, []);

  const deleteBoard = useCallback(async (id) => {
    await api.delete(`/boards/${id}`);
    setBoards((prev) => prev.filter((b) => b._id !== id));
  }, []);

  // ─── Lists ─────────────────────────────────────────────────────────────────

  const createList = useCallback(async (title, boardId) => {
    const { data } = await api.post('/lists', { title, boardId });
    setLists((prev) => [...prev, data]);
    return data;
  }, []);

  const updateList = useCallback(async (id, title) => {
    const { data } = await api.put(`/lists/${id}`, { title });
    setLists((prev) => prev.map((l) => (l._id === id ? data : l)));
  }, []);

  const deleteList = useCallback(async (id) => {
    await api.delete(`/lists/${id}`);
    setLists((prev) => prev.filter((l) => l._id !== id));
    setTasks((prev) => prev.filter((t) => t.list !== id));
  }, []);

  const reorderListsOptimistic = useCallback(async (reorderedLists) => {
    setLists(reorderedLists);
    const boardId = reorderedLists[0]?.board;
    await api.put('/lists/reorder', {
      boardId,
      orderedListIds: reorderedLists.map((l) => l._id),
    });
  }, []);

  // ─── Tasks ─────────────────────────────────────────────────────────────────

  const createTask = useCallback(async (taskData) => {
    const { data } = await api.post('/tasks', taskData);
    setTasks((prev) => [...prev, data]);
    return data;
  }, []);

  const updateTask = useCallback(async (id, updates) => {
    const { data } = await api.put(`/tasks/${id}`, updates);
    setTasks((prev) => prev.map((t) => (t._id === id ? data : t)));
    return data;
  }, []);

  const deleteTask = useCallback(async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  }, []);

  // Optimistic drag-and-drop move
  const moveTaskOptimistic = useCallback(async (taskId, destinationListId, newPosition, boardId, optimisticTasks) => {
    setTasks(optimisticTasks);
    await api.put('/tasks/reorder', {
      boardId,
      listId: destinationListId,
      orderedTaskIds: optimisticTasks
        .filter((t) => t.list === destinationListId)
        .map((t) => t._id),
    });
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <BoardContext.Provider
      value={{
        boards,
        currentBoard,
        lists,
        tasks,
        loading,
        error,
        fetchBoards,
        fetchBoard,
        createBoard,
        deleteBoard,
        createList,
        updateList,
        deleteList,
        reorderListsOptimistic,
        createTask,
        updateTask,
        deleteTask,
        moveTaskOptimistic,
        clearError,
        setTasks,
        setLists,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error('useBoard must be used within BoardProvider');
  return ctx;
};
