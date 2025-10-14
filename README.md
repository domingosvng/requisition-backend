# Requisition Management System (Sistema de Gestão de Requisições)

A full-stack web application for managing requisitions, inventory, and suppliers with role-based access control.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- PostgreSQL 12+
- Ports 3001 (backend) and 5173 (frontend) available

### Installation & Running

1. **Setup Database**
   ```bash
   sudo service postgresql start
   sudo -u postgres psql -c "CREATE DATABASE gestao_requisicoes_db;"
   sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '0H4N4VNG';"
   ```

2. **Install Dependencies**
   ```bash
   # Backend
   npm install
   
   # Frontend
   cd frontend-vue
   npm install
   cd ..
   ```

3. **Start Servers** (in separate terminals)
   ```bash
   # Terminal 1: Frontend (start this first!)
   cd frontend-vue
   npm run dev
   
   # Terminal 2: Backend
   npm run dev
   ```

4. **Access Application**
   - Frontend: http://localhost:5173/
   - Backend API: http://localhost:3001/

## 📋 Features

- **User Authentication**: Login and registration with JWT tokens
- **Requisition Management**: Create, view, approve/reject requisitions
- **Inventory Management**: Track and manage inventory items
- - **Supplier Management**: Manage supplier information
- **Role-Based Access Control**: 
  - SOLICITANTE (Requester)
  - ADMIN_TEC (Technical Admin)
  - GESTOR_DADM (DADM Manager)
  - ADMIN (Administrator)

## 🏗️ Technology Stack

### Frontend
- Vue 3 (Composition API with `<script setup>`)
- Vue Router 4
- Axios
- Vite

### Backend
- Node.js with TypeScript
- Express.js
- TypeORM
- PostgreSQL
- JWT Authentication
- bcrypt

## 📁 Project Structure

```
requisition-backend/
├── src/                    # Backend source code
│   ├── entity/            # TypeORM entities
│   ├── routes/            # API routes
│   └── index.ts           # Express server entry point
├── frontend-vue/          # Vue 3 frontend application
│   ├── src/
│   │   ├── components/    # Vue components
│   │   ├── router/        # Vue Router config
│   │   └── services/      # API services
│   └── vite.config.js     # Vite configuration
├── .env                   # Environment variables
└── RUNNING_THE_APP.md     # Detailed setup guide
```

## 🔧 Configuration

Environment variables are stored in `.env`:

```env
DB_USERNAME=postgres
DB_HOST=localhost
DB_DATABASE=gestao_requisicoes_db
DB_PASSWORD=0H4N4VNG
DB_PORT=5432
JWT_SECRET=yourSuperSecretKey
```

## 📖 Documentation

- [Detailed Setup Guide](./RUNNING_THE_APP.md) - Comprehensive installation and troubleshooting
- [Frontend README](./frontend-vue/README.md) - Frontend-specific documentation

## 🐛 Troubleshooting

### Frontend shows 404 error
- Ensure you're running `npm run dev` from the `frontend-vue` directory
- Check that port 5173 is available
- Verify dependencies are installed

### Backend connection errors
- Ensure PostgreSQL is running: `sudo service postgresql status`
- Check database credentials in `.env`
- Verify backend is on port 3001: `netstat -tln | grep 3001`

### Database connection failed
- Start PostgreSQL: `sudo service postgresql start`
- Verify database exists: `sudo -u postgres psql -l | grep gestao_requisicoes_db`

See [RUNNING_THE_APP.md](./RUNNING_THE_APP.md) for more troubleshooting tips.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Development Team - Requisition Management System

## 🙏 Acknowledgments

- Built with Vue 3 and TypeScript
- Powered by Vite for fast development
- Database management with TypeORM
