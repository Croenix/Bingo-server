# Bingo Game Server

Independent Express + Socket.io + MongoDB/Mongoose backend for the Bingo game. Features real-time multiplayer room management, automatic database cleanup, Vivox voice chat authentication token generation, user profile management with Device ID lookup, challenge category controls, and a modern Web Admin Panel.

---

## Features

- 🎮 **Multiplayer Room System**:
  - Dynamic room creation with custom room ID support or auto-generated 6-character uppercase codes.
  - Dynamic capacity limit enforcement (2–10 players).
  - Password-protected and public room support.
  - MongoDB Mongoose persistence tracking player details (`userId`, `name`, `socketId`, `isCreator`, `isReady`, `joinedAt`).
  - **Automatic Database Cleanup**: Immediate hard-delete from MongoDB (`Room.deleteOne`) when the room creator exits, disconnects, or when the game ends.
  - Real-time Socket.io broadcasting of full player rosters on `player_joined`, `player_left`, and `room_deleted`.

- 🎙️ **Vivox Voice Chat Integration**:
  - HMAC-SHA256 Vivox Access Token (VAT) generator (`utils/vivox.js`).
  - Generates signed tokens, User SIP URIs (`sip:.issuer.username.@domain`), and Channel SIP URIs (`sip:confctl-g-issuer.roomId@domain`).

- 👤 **User Profiles & Device ID Lookup**:
  - Register and update user profile with `name`, `gmailId`, `deviceId`, `coins`, and `gems`.
  - Lookup user details by `deviceId` (`GET /api/users/device/:deviceId`) or `gmailId` (`GET /api/users/gmail/:gmailId`).

- 🏆 **Game Challenges & Categories**:
  - Challenge categories (`Standard`, `Tournament`, `Daily`, etc.).
  - Detailed challenge payload with entry fee (coins/gems), reward prize (coins/gems), max online player capacity, gradient colors, and status.
  - Filter challenges by category or search query via API (`GET /api/challenges`).

- 🖥️ **Web Admin Panel Dashboard**:
  - Real-time dashboard at 👉 **[http://localhost:3000/admin](http://localhost:3000/admin)**.
  - **Rooms & Vivox Tester**: Interactive room creation, Vivox token generator tool with 1-click copy, and live active rooms table with joined players badges.
  - **User & Rewards Control**: Manage accounts, update coins/gems, view JSON documents, and export to CSV.
  - **Challenges Management**: Create, edit, and categorize game challenges with live gradient previews.
  - **MongoDB Live Telemetry**: Live ping, collection document counts, and index stats.

---

## Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create or edit `.env` in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb+srv://user:pass@cluster0.mongodb.net/bingo_game?retryWrites=true&w=majority
   JWT_SECRET=bingo_game_super_secret_jwt_key_2026
   ADMIN_EMAIL=admin@admin
   ADMIN_PASSWORD=achu
   CORS_ORIGIN=*

   # Vivox Voice Chat Configuration
   VIVOX_ISSUER=bingo1234-vi0
   VIVOX_DOMAIN=v3.vivox.com
   VIVOX_SECRET_KEY=bingo_vivox_secret_key_2026
   ```

3. **Run Server**:
   ```bash
   # Production
   npm start

   # Development (Auto-reload)
   npm run dev
   ```

---

## Web Admin Panel

Access the Admin Dashboard in your browser:
👉 **[http://localhost:3000/admin](http://localhost:3000/admin)**

**Default Admin Credentials:**
- **Email:** `admin@admin`
- **Password:** `achu`

---

## API Endpoints Reference

### Public & Game Client APIs

| HTTP Method | Endpoint Path | Description |
|---|---|---|
| `GET` | `/api/health` | Public server health check and MongoDB connection status |
| `POST` | `/api/users` | Register or update user profile (`name`, `gmailId`, `deviceId`) |
| `GET` | `/api/users/device/:deviceId` | Search and fetch user profile by Device ID |
| `GET` | `/api/users/gmail/:gmailId` | Search and fetch user profile by Gmail ID |
| `GET` | `/api/users?deviceId=ID` | Search user profile by `deviceId` or `gmailId` query |
| `POST` | `/api/rooms` | Create dynamic room with capacity limit, optional custom ID & password |
| `GET` | `/api/rooms` | List active available public rooms |
| `GET` | `/api/rooms/:roomId` | Fetch details and player roster for a specific room |
| `POST` | `/api/rooms/:roomId/join` | Join room with capacity limit and password verification |
| `POST` | `/api/rooms/:roomId/leave` | Leave room (deletes room from MongoDB if creator exits) |
| `POST` | `/api/rooms/:roomId/vivox-token` | Generate Vivox voice chat authentication token |
| `POST` | `/api/rooms/:roomId/end` | End game and delete room from MongoDB |
| `DELETE` | `/api/rooms/:roomId` | Remove/delete room permanently from MongoDB |
| `GET` | `/api/challenges` | Get active game challenges (supports `?category=...` and `?search=...`) |
| `GET` | `/api/challenges/categories` | Get distinct active challenge categories |
| `GET` | `/api/challenges/:id` | Get challenge details by ID |

---

### Socket.io Real-Time Events

#### Client to Server (Emit)
- `create_room`: `{ userId, userName, roomName, capacity, customRoomId, password, isPublic }`
- `join_room`: `{ roomId, userId, userName, password }`
- `leave_room`: `{ roomId, userId }` (Auto-deletes room from MongoDB if creator leaves)
- `end_game`: `{ roomId, userId, gameResults }` (Deletes room from MongoDB)

#### Server to Client (Listen)
- `room_created`: `{ ok: true, room, vivox: { token, channelUri, userUri } }`
- `room_joined`: `{ ok: true, room, vivox: { token, channelUri, userUri } }`
- `player_joined`: `{ player, players, playersCount, capacity }` (Broadcasts updated roster)
- `player_left`: `{ userId, players, playersCount }` (Broadcasts updated roster)
- `room_deleted`: `{ roomId, reason }` (Broadcasted when room is removed from MongoDB)
- `game_ended`: `{ roomId, endedBy, results }`
- `room_error`: `{ event, error }`

---

### Protected Admin APIs (`Authorization: Bearer <token>`)

| HTTP Method | Endpoint Path | Description |
|---|---|---|
| `POST` | `/api/admin/login` | Authenticate admin and return JWT token |
| `GET` | `/api/admin/stats` | Overall system registration statistics |
| `GET` | `/api/admin/system` | Detailed server telemetry and settings |
| `GET` | `/api/admin/db-status` | Live MongoDB connection telemetry & collections breakdown |
| `GET` | `/api/admin/users` | Paginated search of users (`?page=1&limit=20&search=john`) |
| `POST` | `/api/admin/users` | Create new user profile with coins & gems |
| `GET` | `/api/admin/users/:id` | Get user document JSON by ID |
| `PATCH` | `/api/admin/users/:id` | Update user profile, coins, gems, and device ID |
| `DELETE` | `/api/admin/users/:id` | Delete user account permanently from MongoDB |
| `GET` | `/api/admin/challenges` | List all game challenges (active & inactive) |
| `POST` | `/api/admin/challenges` | Create new game challenge with category & colors |
| `GET` | `/api/admin/challenges/:id` | Fetch challenge details by ID |
| `PATCH` | `/api/admin/challenges/:id` | Update challenge details and status |
| `DELETE` | `/api/admin/challenges/:id` | Delete challenge from MongoDB |

---

## License & Security
For production deployment, use HTTPS, set strong JWT secrets, restrict CORS origins, and whitelist server IPs in MongoDB Atlas.
