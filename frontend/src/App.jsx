import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BoardProvider } from './context/BoardContext';
import PrivateRoute from './components/Auth/PrivateRoute';
import Navbar from './components/UI/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BoardPage from './pages/BoardPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <BoardProvider>
          <div className="app">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <>
                      <Navbar />
                      <DashboardPage />
                    </>
                  </PrivateRoute>
                }
              />
              <Route
                path="/board/:id"
                element={
                  <PrivateRoute>
                    <>
                      <Navbar />
                      <BoardPage />
                    </>
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BoardProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
