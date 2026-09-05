# Bingo User Server

Independent Express + MongoDB/Mongoose backend for the Bingo game.

## Install
```bash
npm install
```

Configure MongoDB and admin credentials in `.env`.

## Run
```bash
npm start
# Development: npm run dev
```

## Admin Web Panel
Access the Admin Dashboard in your web browser:
👉 **[http://localhost:3000/admin](http://localhost:3000/admin)** or **[http://localhost:3000](http://localhost:3000)**

**Default Credentials (from `.env`):**
- **Admin Email:** `admin@admin`
- **Admin Password:** `achu`

### Features:
- 📊 **Dashboard Overview:** Live user statistics, daily registration counts, MongoDB connection status, system uptime, and memory usage metrics.
- 👥 **User Data Management:** Real-time search/filtering, pagination, detailed JSON viewing, profile editing, account creation, and user deletion.
- ⚙️ **Server Options & Diagnostics:** Live endpoint interactive tester (`/api/health`, `/api/admin/stats`, `/api/admin/system`, `/api/admin/users`), environment settings, and API routes registry.
- 📁 **Data Export:** Export user records to CSV or JSON with one click.

## API Endpoints
- GET `/api/health`
- POST `/api/users` with `{ "name": "John", "gmailId": "john@gmail.com" }`
- POST `/api/admin/login` with `{ "email": "admin@admin", "password": "achu" }`

Protected admin endpoints (use `Authorization: Bearer <token>`):
- GET `/api/admin/stats` - Total and daily registration statistics
- GET `/api/admin/system` - Detailed server options and telemetry
- GET `/api/admin/users?page=1&limit=20&search=john` - Paginated user search
- POST `/api/admin/users` - Create new user from admin panel
- GET `/api/admin/users/:id` - Fetch user details by ID
- PATCH `/api/admin/users/:id` - Update user details
- DELETE `/api/admin/users/:id` - Delete user account

For production, use HTTPS, a strong secret, restricted CORS, a hashed admin password, and verify Google identity tokens server-side.

