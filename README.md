# Playlog

Playlog is a full-stack gaming tracker, social leaderboard, and discovery platform.

## Stack

- Frontend: React, TypeScript, Vite, React Router
- Backend: Node.js, Express, TypeScript, Prisma, JWT
- Database: PostgreSQL

## Apps

- `frontend/`: Vercel-ready React app
- `backend/`: Railway-ready API with Prisma ORM

## Quick start

1. Install dependencies:
   - `npm install`
2. Configure env files:
   - `backend/.env`
   - `frontend/.env`
3. Make sure PostgreSQL is running and `DATABASE_URL` points to your database.
4. Generate Prisma client:
   - `npm run prisma:generate --workspace backend`
5. Run migrations:
   - `npm run prisma:migrate --workspace backend`
6. Start apps in separate terminals:
   - `npm run dev --workspace backend`
   - `npm run dev --workspace frontend`

## Environment variables

### Backend

- `DATABASE_URL`
- `JWT_SECRET`
- `RAWG_API_KEY`
- `PORT`
- `CLIENT_URL`

### Frontend

- `VITE_API_URL`

## Deployment

- Frontend deploys on Vercel with `npm run build --workspace frontend`
- Backend deploys on Railway with `npm run build --workspace backend` then `npm run start --workspace backend`
