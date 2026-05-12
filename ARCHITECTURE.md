# Academic Search System - Step by Step

## 1) Project structure

This project is now split logically as:

- `frontend/` (current React app in root): user interface, login, dashboard, search, favorites
- `backend/`: Node.js + Express API, MongoDB models, auth middleware

Backend folders:

- `backend/src/models`: MongoDB collections (`User`, `Document`)
- `backend/src/routes`: API endpoints (`auth`, `search`, `favorites`, `documents`)
- `backend/src/middleware`: authentication and role authorization
- `backend/src/config`: MongoDB connection
- `backend/src/seed.js`: test users and documents seeding

## 2) Authentication and session flow

1. Frontend sends credentials to `POST /api/auth/login`.
2. Backend validates password hash and role (`admin`, `teacher`, `student`).
3. Backend returns JWT token and user payload.
4. Frontend stores token in `localStorage` and calls `GET /api/auth/session` on app boot.
5. Protected endpoints require `Authorization: Bearer <token>`.

## 3) Search and favorites flow

- Search endpoint: `GET /api/search`
  - Query params: `title`, `author`, `keyword`, `type`, `year`
- Favorites:
  - `GET /api/favorites`
  - `POST /api/favorites/:documentId`
  - `DELETE /api/favorites/:documentId`

## 4) Role behavior

- `student`: can login, search, and manage favorites
- `teacher`: same as student + create documents
- `admin`: full teacher features + operational ownership

`POST /api/documents` is protected with role middleware for `admin` and `teacher`.

## 5) Setup and run

### Prerequisites

- Node.js 18+
- MongoDB running locally or remotely

### Backend

1. `cd backend`
2. Copy `.env.example` to `.env`
3. Update `MONGODB_URI` and `JWT_SECRET`
4. Install: `npm install`
5. Seed demo data: `npm run seed`
6. Start API: `npm run dev`

### Frontend (root)

1. `cd ..` (project root)
2. Install: `npm install`
3. Start React app: `npm start`

Optional one-command run from root:

- `npm run start:full`

## 6) Demo users

After seeding:

- `admin@ucp.edu` / `Admin123!`
- `teacher@ucp.edu` / `Teacher123!`
- `student@ucp.edu` / `Student123!`

## 7) Optional Apache reverse proxy

Use `backend/apache-vhost.conf` as baseline:

- serve frontend static build from Apache
- forward `/api` to `http://localhost:5000/api`

Make sure Apache modules are enabled:

- `proxy`
- `proxy_http`
- `headers`

