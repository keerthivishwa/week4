# ProjectFlow – Project Management Dashboard

Week 4 Capstone Project demonstrating:
- Advanced React components & API integration
- Application testing & debugging
- Deployment on cloud platforms (Vercel / Render / MongoDB Atlas)
- Documentation & presentation

---

## Tech Stack

| Layer     | Technology                                   |
|-----------|----------------------------------------------|
| Frontend  | React 18, Vite, React Router v6, @dnd-kit    |
| Backend   | Node.js, Express 4, MongoDB, Mongoose        |
| Auth      | JWT (jsonwebtoken), bcryptjs                 |
| Deploy    | Vercel (frontend) + Render (backend) + MongoDB Atlas |

---

## Features

- **Boards** — Create and manage project boards with custom colors
- **Lists** — Kanban columns per board (To Do / In Progress / Done)
- **Task Cards** — Rich task cards with priority, labels, due dates, assignees
- **Drag & Drop** — Move tasks between lists and reorder lists using @dnd-kit
- **Role-Based Access** — Admin users can create/delete boards; Members can add tasks
- **JWT Authentication** — Register, Login, protected routes

---

## Project Structure

```
week4_major/
├── backend/
│   ├── server.js              # Express entry point
│   ├── .env                   # Environment variables (local)
│   ├── .env.example           # Template for production
│   ├── models/
│   │   ├── User.js
│   │   ├── Board.js
│   │   ├── List.js
│   │   └── Task.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── boardController.js
│   │   ├── listController.js
│   │   └── taskController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── boardRoutes.js
│   │   ├── listRoutes.js
│   │   └── taskRoutes.js
│   └── middleware/
│       ├── authMiddleware.js
│       └── errorMiddleware.js
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   ├── api/axios.js          # Axios instance + interceptors
    │   ├── context/
    │   │   ├── AuthContext.jsx   # Auth state & JWT
    │   │   └── BoardContext.jsx  # Boards/Lists/Tasks state
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   └── BoardPage.jsx     # DnD board view
    │   └── components/
    │       ├── Auth/PrivateRoute.jsx
    │       ├── UI/{Navbar,Modal}.jsx
    │       ├── Board/{ListColumn,AddListForm}.jsx
    │       └── Task/{TaskCard,AddTaskForm,TaskDetailModal}.jsx
```

---

## Getting Started (Local)

### 1. Prerequisites
- Node.js 18+
- MongoDB (local) OR a free MongoDB Atlas cluster

### 2. Backend Setup

```bash
cd backend
# Copy the example env and fill in your values
copy .env.example .env

# Install dependencies
npm install

# Start dev server (with auto-reload)
npm run dev
```

Backend runs at **http://localhost:5000**

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**  
Vite proxy forwards `/api/*` to the backend automatically.

---

## API Endpoints

### Auth
| Method | Route              | Access  | Description         |
|--------|--------------------|---------|---------------------|
| POST   | /api/auth/register | Public  | Register new user   |
| POST   | /api/auth/login    | Public  | Login & get token   |
| GET    | /api/auth/me       | Private | Get current user    |
| GET    | /api/auth/users    | Admin   | Get all users       |

### Boards
| Method | Route                    | Description              |
|--------|--------------------------|--------------------------|
| GET    | /api/boards              | Get user's boards        |
| POST   | /api/boards              | Create board             |
| GET    | /api/boards/:id          | Get board + lists/tasks  |
| PUT    | /api/boards/:id          | Update board             |
| DELETE | /api/boards/:id          | Delete board (cascade)   |
| POST   | /api/boards/:id/members  | Add member               |

### Lists
| Method | Route            | Description       |
|--------|------------------|-------------------|
| POST   | /api/lists       | Create list       |
| PUT    | /api/lists/:id   | Update list title |
| DELETE | /api/lists/:id   | Delete list       |
| PUT    | /api/lists/reorder | Reorder lists   |

### Tasks
| Method | Route             | Description          |
|--------|-------------------|----------------------|
| POST   | /api/tasks        | Create task          |
| PUT    | /api/tasks/:id    | Update task          |
| DELETE | /api/tasks/:id    | Delete task          |
| PUT    | /api/tasks/move   | Move task (DnD)      |
| PUT    | /api/tasks/reorder| Bulk reorder tasks   |

---

## Deployment

### MongoDB Atlas
1. Create a free cluster at https://cloud.mongodb.com
2. Add a database user and whitelist your IP (or `0.0.0.0/0` for render)
3. Copy the connection string into the `MONGO_URI` env var

### Backend → Render
1. Push `backend/` folder to GitHub
2. New Web Service on Render → connect repo
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`

### Frontend → Vercel
1. Push `frontend/` folder to GitHub
2. New Project on Vercel → import repo
3. Framework: Vite
4. Add env var: `VITE_API_URL=https://your-backend.onrender.com`
5. Update `vite.config.js` proxy target or use `import.meta.env.VITE_API_URL` in axios.js

---

## Role-Based Access Summary

| Action                  | Admin | Member |
|-------------------------|-------|--------|
| Create board            | ✅    | ❌     |
| Delete board            | ✅    | ❌     |
| Add/delete lists        | ✅    | ✅     |
| Add/edit/delete tasks   | ✅    | ✅     |
| Drag & drop tasks/lists | ✅    | ✅     |
| Add board members       | ✅    | ❌     |
| View all users          | ✅    | ❌     |
