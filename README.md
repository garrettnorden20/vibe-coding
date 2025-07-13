# VibeMap

A minimal proof-of-concept for anonymous map-based messages. This repository contains
an unbuilt React frontend and an Express + SQLite backend.

## Frontend

The frontend lives in `frontend/` and uses React via CDN along with Leaflet for the map.
Open `frontend/index.html` in a browser to try it. Dropping a pin will send a POST
request to `/pins` on the same origin.

## Backend

The backend lives in `backend/`. It requires Node.js and installs dependencies via npm:

```bash
cd backend
npm install
node server.js
```

This starts an Express server listening on port 3000 with two endpoints:
`GET /pins` and `POST /pins`. Pins are stored in `database.sqlite`. A simple cleanup
runs hourly to remove pins older than 24 hours.

## Limitations

This code is a minimal demo. It does not include authentication or production-level
error handling. Running the backend requires internet access to install dependencies.
