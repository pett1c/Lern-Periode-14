# Eventify Backend Smoke (Postman)

## Preconditions

- `backend/.env` exists with:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `OPENROUTER_API_KEY` (for chat route bootstrapping)
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

- Current local run in this session is blocked until `.env` keys are provided in `backend/.env`.
