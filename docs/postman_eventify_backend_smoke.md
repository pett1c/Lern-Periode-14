# Eventify Backend Smoke + Runbook

## Preconditions

- `backend/.env` exists with:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `ENABLE_OAUTH=false` (default for stable local runs)
  - optional: `OPENROUTER_API_KEY`, `PINECONE_API_KEY`
- Backend running: `npm run start` in `backend/`
- Base URL: `http://localhost:5000/api`

## Test Accounts

- `user` role
- `organizer` role
- `admin` role

## Sequence

1. `POST /auth/register` for `user`, `organizer`, `admin`
2. `POST /auth/login` for each role and save `token`
3. `GET /auth/me` with each token
4. Organizer:
   - `POST /events`
   - `PATCH /events/:id`
   - `DELETE /events/:id` (optional after booking checks)
5. User:
   - `POST /tickets/book`
   - `GET /tickets/me`
   - `PATCH /tickets/:id/cancel` (optional)
6. Admin:
   - `GET /admin/events`
   - `GET /admin/tickets`
7. Negative checks:
   - User tries `POST /events` -> expect `403`
   - Organizer tries `/admin/*` -> expect `403`
   - Invalid payload -> expect `400` with `error.details`

## Expected response contract

- Success:
  - `success: true`
  - `message: string`
  - `data: object`
- Error:
  - `success: false`
  - `message: string`
  - `error.code: string`
  - `error.details: array | null`

## Notes

- OAuth is intentionally disabled by default (`ENABLE_OAUTH=false`).
  - `/api/auth/google` and `/api/auth/github` should return `503 FEATURE_DISABLED`.
  - Frontend social buttons are disabled and show "coming soon".

## Local quality gates

- Backend:
  - `cd backend`
  - `npm test`
- Frontend:
  - `cd frontend`
  - `npm run lint`
  - `npm run build`
  - `npm test`

## CI expectations

- GitHub Actions workflow runs:
  - backend install + tests
  - frontend install + lint + build + tests
- PR should only be merged when CI is green.
