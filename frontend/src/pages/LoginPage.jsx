import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    clearError();
    setFormError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setFormError('Please fill in all fields');
      return;
    }
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch {
      // error is in context
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>ProjectFlow</h1>
          <p>Project Management Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} noValidate aria-label="Login form">
          {(error || formError) && (
            <div className="alert alert-error" role="alert">
              {error || formError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
              aria-required="true"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full btn-lg"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? <span className="spinner" aria-hidden="true"></span> : null}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">Create one</Link>
        </div>

        {/* Demo hint */}
        <div style={{ marginTop: 20, padding: '12px', background: '#f4f5f7', borderRadius: 8, fontSize: 13, color: '#6b778c' }}>
          <strong>Demo:</strong> Register with role <code>admin</code> to unlock board management features.
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
