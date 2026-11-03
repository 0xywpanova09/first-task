# TeamPulse

Simple internal daily check-in app for teams. Members submit a short check-in (name, mood, what they worked on, blockers) and can view recent updates.

## Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js + Express
- **Database:** MongoDB

## Features

- Submit a check-in
- View recent check-ins (newest first)
- Delete a check-in
- Health endpoint: `GET /api/health`
- Clear validation errors when name or mood is missing
- Frontend shows an error if the backend cannot be reached

## Project structure

```
backend/          Express API
frontend/         React app
deploy/           Nginx configs for AWS and Azure
docker-compose.yml
.env.example
```

## Run locally

### Prerequisites

- Node.js LTS
- MongoDB running locally (or update `MONGODB_URI`)

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

API runs at `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:3000` and proxies `/api` to the backend.

### API endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | API + DB status |
| GET | `/api/checkins` | List check-ins |
| POST | `/api/checkins` | Create check-in |
| DELETE | `/api/checkins/:id` | Delete check-in |

## Docker Compose (local / Azure style)

```bash
docker compose up --build -d
```

- Frontend container: `http://localhost:8080`
- Backend container: `http://localhost:5000`
- MongoDB: internal only (`mongodb:27017`)

On Azure, put host Nginx in front using `deploy/nginx-azure.conf` so users hit the VM public IP on port 80.

## AWS EC2 (PM2 + Nginx)

High-level approach:

1. Create an Ubuntu 24.04 EC2 instance and open HTTP (80) publicly; restrict SSH (22) to your IP.
2. Install Node.js, PM2, Nginx, and MongoDB on the instance.
3. Clone the repo, configure backend `.env` with `MONGODB_URI`, install dependencies, and start the API with PM2.
4. Build the React app (`npm run build` in `frontend`) and serve the `dist` folder with Nginx.
5. Use `deploy/nginx-aws.conf` so `/api` is proxied to the Node process and static files are served from Nginx.
6. Enable PM2 startup and Nginx so the app comes back after reboot.

## Azure VM (Docker + Compose + Nginx)

High-level approach:

1. Create an Ubuntu 24.04 Azure VM; allow HTTP (80) publicly and restrict SSH to your IP.
2. Install Docker Engine and Docker Compose.
3. Clone the repo and run `docker compose up --build -d`.
4. Install Nginx on the VM and use `deploy/nginx-azure.conf` to forward `/` to the frontend container and `/api` to the backend container.
5. Containers use `restart: unless-stopped` so the stack recovers after a VM reboot.

## Environment variables

See `.env.example`. Never commit real `.env` files or credentials.
