# Campus Duel — Real-Time Competitive Coding Arena (Frontend)

This is the **frontend-only** Campus Duel experience built around the existing project concept.

## Included feature scope

Implemented in the UI:
- Competitive coding arena concept and Code Duel flow
- Real coding IDE experience with Monaco Editor
- JavaScript, Python, Java, C++, and C language selector
- Problem statement, examples, constraints, public/hidden test indicators
- Live test-result simulation and opponent status
- Socket.IO-ready event integration
- Private opponent source-code experience
- Multi-factor scoring/result-ready UI
- Attack Mode with constraint/rate-limit rule messaging
- Bug Battle, Speed Coding, and Code Golf mode selection
- Admin problem studio
- Full problem category bank
- Dark competitive-game UI
- Home dashboard
- ELO/profile/leaderboard/achievement experience
- Responsive desktop/tablet/mobile layouts

## Important architecture note

The uploaded `campus-duel-mern` archive was structurally present but its source files were 0 bytes. Therefore this frontend does **not overwrite or pretend to preserve implementation that was not present in the supplied archive**.

The frontend is intentionally API/socket ready so it can be connected to the existing MERN backend when the actual backend source is available.

## Run

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Environment

Copy `.env.example` to `.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Backend integration points

Keep server-side judging, hidden tests, scoring, ELO, authentication, authorization, and validation on the backend.

Socket event names expected by this UI include:

- `duel:created`
- `duel:joined`
- `duel:started`
- `duel:countdown`
- `duel:player-ready`
- `duel:code-submitted`
- `duel:submission-status`
- `duel:opponent-status`
- `duel:player-solved`
- `duel:attack-started`
- `duel:attack-result`
- `duel:finished`
- `duel:cancelled`

Do not send JWTs, hidden tests, or opponent source code to public clients.


## Authentication / fresh database behavior

The application now starts at a single public **Login / Register home page**.

- No user is pre-populated in the frontend.
- No `Hari` account is seeded.
- A new registration is sent to `POST /api/auth/register`.
- Login is sent to `POST /api/auth/login`.
- The backend must create users in a fresh MongoDB database; this frontend does not seed MongoDB.
- Protected pages redirect unauthenticated users back to `/auth`.
- Sign out clears the local session.
- New UI-only testing can use `VITE_DEMO_AUTH=true`, but this does not create database records.

Recommended fresh MongoDB setup: point the backend `MONGODB_URI` at a new/empty database before starting the server. Do not run any seed script.
