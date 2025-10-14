# Running the Application

This guide explains how to start the frontend and backend servers for the Requisition Management System.

## Prerequisites

- Node.js and npm installed
- PostgreSQL installed and running
- Ports 3001 (backend) and 5173 (frontend) available

## Database Setup

1. Start PostgreSQL service:
   ```bash
   sudo service postgresql start
   ```

2. Create the database (if not already created):
   ```bash
   sudo -u postgres psql -c "CREATE DATABASE gestao_requisicoes_db;"
   ```

3. Set the PostgreSQL password (if needed):
   ```bash
   sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '0H4N4VNG';"
   ```

## Installation

1. Install backend dependencies:
   ```bash
   npm install
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend-vue
   npm install
   cd ..
   ```

## Starting the Servers

**IMPORTANT**: Always start the frontend server first, then the backend.

### 1. Start the Frontend Server (Port 5173)

Open a terminal and run:
```bash
cd frontend-vue
npm run dev
```

The frontend will be available at: http://localhost:5173/

### 2. Start the Backend Server (Port 3001)

Open a new terminal and run:
```bash
npm run dev
```

The backend API will be available at: http://localhost:3001/

## Verifying the Setup

1. Open your browser and navigate to http://localhost:5173/
2. You should see the login page: "Sistema de Gestão de Requisições (VUE)"
3. You can register a new account or login with existing credentials

## Troubleshooting

### Frontend shows 404 error

- Make sure you're running `npm run dev` from the `frontend-vue` directory
- Check that port 5173 is not being used by another application
- Verify that all dependencies are installed: `cd frontend-vue && npm install`

### Backend connection errors

- Ensure PostgreSQL is running: `sudo service postgresql status`
- Check that the database exists and credentials in `.env` are correct
- Verify backend is running on port 3001: `netstat -tln | grep 3001`

### Port conflicts

If you get a port conflict error, you can kill processes using:
```bash
# For Linux/Mac
lsof -ti:5173 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

## Environment Variables

The backend uses the following environment variables from `.env`:
- `DB_USERNAME`: PostgreSQL username (default: postgres)
- `DB_HOST`: Database host (default: localhost)
- `DB_DATABASE`: Database name (default: gestao_requisicoes_db)
- `DB_PASSWORD`: PostgreSQL password
- `DB_PORT`: PostgreSQL port (default: 5432)
- `JWT_SECRET`: Secret key for JWT authentication
