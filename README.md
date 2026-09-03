# Campus Duel — Full MERN Project

This package contains both the **frontend and backend**. The previous frontend-only ZIP was missing the server; this build fixes that.

## 1. Fresh database

The backend defaults to:
`mongodb://127.0.0.1:27017/campus_duel_fresh`

No user seed script is run. No demo account is inserted. Registering creates the first real user in MongoDB.

## 2. Run backend

```bash
cd server
npm install
npm run dev
```

Expected:
- MongoDB connected
- Campus Duel server running at http://localhost:5000

## 3. Run frontend

In another terminal:

```bash
cd client
npm install
npm run dev
```

Open the Vite URL, normally http://localhost:5173.

## 4. Registration flow

The frontend calls:
`POST http://localhost:5000/api/auth/register`

Login calls:
`POST http://localhost:5000/api/auth/login`

The backend hashes passwords with bcrypt, creates the user with 1200 ELO, and returns a JWT.

## 5. Important

Make sure MongoDB is running before starting the server. Do not enable `VITE_DEMO_AUTH` for the real project; keep it false.
