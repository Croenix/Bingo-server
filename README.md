# Bingo User Server

Independent Express + MongoDB/Mongoose backend for the Bingo game.

## Install
npm install

Copy `.env.example` to `.env` and configure MongoDB and admin credentials.

## Run
npm start

Development: `npm run dev`

## API
GET `/api/health`

POST `/api/users` with `{ "name": "John", "gmailId": "john@gmail.com" }`

POST `/api/admin/login` with `{ "email": "admin@example.com", "password": "..." }`

Protected admin endpoints use `Authorization: Bearer <token>`:
- GET `/api/admin/stats`
- GET `/api/admin/users?page=1&limit=20&search=john`
- GET `/api/admin/users/:id`
- PATCH `/api/admin/users/:id`
- DELETE `/api/admin/users/:id`

For production, use HTTPS, a strong secret, restricted CORS, a hashed admin password, and verify Google identity tokens server-side instead of trusting a Gmail string supplied by the Unity client.
