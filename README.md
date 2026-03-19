# PSWCares Monorepo

Production-ready starter monorepo for PSWCares using:

- Frontend: React (Vite) + Tailwind CSS + Axios
- Backend: Node.js + Express + MongoDB (Mongoose)
- Auth baseline: JWT dependency included (feature implementation pending)
- Realtime baseline: Socket.io server initialization included

This repository is intentionally scaffolded only. Business features are not implemented yet.

## Project Structure

```text
.
├─ client/
│  ├─ .env.example
│  ├─ index.html
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ tailwind.config.js
│  ├─ vite.config.js
│  └─ src/
│     ├─ App.jsx
│     ├─ main.jsx
│     ├─ components/
│     ├─ assets/
│     ├─ pages/
│     │  ├─ HomePage.jsx
│     │  └─ NotFoundPage.jsx
│     ├─ routes/
│     │  └─ AppRouter.jsx
│     ├─ services/
│     │  └─ api.js
│     └─ styles/
│        └─ index.css
├─ server/
│  ├─ .env.example
│  ├─ package.json
│  └─ src/
│     ├─ app.js
│     ├─ server.js
│     ├─ config/
│     │  ├─ db.js
│     │  ├─ env.js
│     │  └─ socket.js
│     ├─ controllers/
│     │  └─ health.controller.js
│     ├─ middlewares/
│     │  ├─ errorHandler.js
│     │  └─ notFound.js
│     ├─ models/
│     ├─ routes/
│     │  ├─ health.routes.js
│     │  └─ index.js
│     ├─ services/
│     │  └─ health.service.js
│     ├─ sockets/
│     └─ utils/
└─ package.json
```

## Prerequisites

- Node.js 20+
- npm 10+
- MongoDB running locally or accessible via URI

## Environment Variables

1. Copy environment templates:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

2. Update values in `server/.env`:

- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_ORIGIN`
- `PORT` (optional, defaults to 5000)

3. Update values in `client/.env`:

- `VITE_API_URL` (defaults to `http://localhost:5000/api`)

## Install Dependencies

From the repository root:

```bash
npm install
```

## Run in Development

Start both frontend and backend from root:

```bash
npm run dev
```

Or run individually:

```bash
npm run dev:server
npm run dev:client
```

## Starter Endpoints

- API root: `GET /`
- Health route: `GET /api/health`

## Secure Admin Seeding

Admin accounts cannot be created through public registration.

Use the secure seed script instead:

1. Set these values in `server/.env`:

- `ADMIN_SEED_NAME`
- `ADMIN_SEED_EMAIL`
- `ADMIN_SEED_PASSWORD` (12+ characters)
- `ADMIN_SEED_TOKEN` (long random value)

2. Run from the `server` directory:

```bash
npm run seed:admin -- --token=YOUR_ADMIN_SEED_TOKEN
```

The script creates the admin if missing, or updates that admin account's password and status if it already exists.

## Architecture Notes

- Backend is organized with modular layers:
  - routes -> controllers -> services -> models
- ES modules are used in both apps (`"type": "module"`)
- Axios client is preconfigured in `client/src/services/api.js`
- Socket.io server is initialized in `server/src/config/socket.js`
