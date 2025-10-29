# Requisition Management System

A comprehensive requisition management system built with TypeScript, Vue 3, and PostgreSQL. Features include inventory management, supplier tracking, multi-stage approval workflows, and Portuguese-Angola localization.

## Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript 5.4.5
- **Framework**: Express.js 4.19.2
- **Database**: PostgreSQL 17 with TypeORM 0.3.20
- **Authentication**: JWT with bcrypt password hashing
- **Development**: ts-node-dev with hot reload

### Frontend
- **Framework**: Vue 3 with Composition API
- **Build Tool**: Vite 7.1.9
- **Styling**: Bootstrap CSS (dark theme)
- **Routing**: Vue Router 4.5.1
- **HTTP Client**: Axios 1.12.2

## Quick Setup (Windows PowerShell)

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 17
- Git

### Installation Steps

1) **Clone and setup repository:**
   ```powershell
   git clone https://github.com/domingosvng/requisition-backend.git
   cd requisition-backend
   ```

2) **Database setup:**
   ```powershell
   # Create PostgreSQL database named 'gestao_requisicoes_db'
   # Copy environment configuration
   copy .env.example .env
   # Edit .env with your database credentials and JWT secret
   ```

3) **Install dependencies:**
   ```powershell
   npm install
   ```

4) **Create admin user (optional):**
   ```powershell
   node scripts/createAdmin.js
   # Creates user: testadmin/testadmin with ADMIN role
   ```

5) **Start backend server:**
   ```powershell
   npm run dev
   # Server runs on http://localhost:3001
   ```

6) **Start frontend server (separate terminal):**
   ```powershell
   # Frontend is in separate directory: requisition-frontend
   cd path/to/requisition-frontend
   npm install
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

## Key Features Implemented

### Authentication & Security
- ✅ JWT-based authentication with secure password hashing
- ✅ Role-based access control (ADMIN, GESTOR_DADM, SOLICITANTE)
- ✅ Developer mode removal for production security
- ✅ CORS configuration for frontend-backend communication

### Inventory Management
- ✅ Complete CRUD operations for inventory items
- ✅ Search functionality with real-time filtering
- ✅ Quantity management with dedicated +/- buttons
- ✅ Currency formatting in Kwanza (Kz) with Portuguese-Angola locale
- ✅ Field alignment between frontend and backend
- ✅ Supplier integration and tracking

### Requisition Workflow
- ✅ Multi-stage approval system (Pending → Gestor Approval → Admin Final)
- ✅ Admin bypass functionality for emergency approvals
- ✅ Status tracking with color-coded badges
- ✅ Comment system for approval/rejection reasons
- ✅ Notification system for workflow updates

### User Interface
- ✅ Responsive Bootstrap dark theme
- ✅ Consistent color palette for status indicators
- ✅ Search functionality across all modules
- ✅ Form validation with real-time feedback
- ✅ Accessible navigation with role-based menu items

### Data Management
- ✅ PostgreSQL database with TypeORM entities
- ✅ Automatic schema synchronization
- ✅ Migration files for database updates
- ✅ Supplier management with NIF validation
- ✅ Comprehensive data relationships

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Inventory
- `GET /api/inventario` - List inventory items
- `POST /api/inventario` - Create inventory item
- `PUT /api/inventario/:id` - Update inventory item
- `DELETE /api/inventario/:id` - Delete inventory item
- `POST /api/inventario/:id/increase` - Increase quantity
- `POST /api/inventario/:id/decrease` - Decrease quantity

### Requisitions
- `GET /api/requisicoes` - List requisitions
- `POST /api/requisicoes` - Create requisition
- `PUT /api/requisicoes/:id/approve` - Approve requisition
- `PUT /api/requisicoes/:id/reject` - Reject requisition
- `PUT /api/requisicoes/:id/accept` - Final acceptance (Admin)

### Suppliers
- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

## Project Structure

```
requisition-backend-main/
├── src/
│   ├── entity/              # TypeORM entities
│   ├── routes/              # API route handlers
│   ├── middleware/          # Authentication middleware
│   └── index.ts            # Main server file
├── scripts/                # Utility scripts
├── migrations/             # Database migrations
└── package.json

requisition-frontend/
├── src/
│   ├── components/         # Vue components
│   ├── services/          # API service layer
│   └── router/            # Vue Router configuration
└── package.json
```

## Development Scripts

```powershell
# Backend development
npm run dev                 # Start with hot reload
npm run build              # Compile TypeScript
npm start                  # Run compiled version

# Database utilities
node scripts/createAdmin.js      # Create admin user
node scripts/testDatabase.js    # Test DB connection
node scripts/checkInventoryData.js  # Verify inventory data

# Frontend development (in frontend directory)
npm run dev                # Start Vite dev server
npm run build             # Build for production
```

## Environment Configuration

Required `.env` variables:
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=gestao_requisicoes_db
JWT_SECRET=your_strong_secret_key
PORT=3001
```

## Production Deployment

1) **Build both applications:**
   ```powershell
   npm run build              # Backend
   cd frontend && npm run build  # Frontend
   ```

2) **Configure production environment:**
   - Set `NODE_ENV=production`
   - Use strong JWT_SECRET
   - Configure PostgreSQL for production
   - Disable TypeORM synchronization

3) **Deploy:**
   - Backend: `npm start`
   - Frontend: Serve `dist/` folder with nginx/Apache

## Troubleshooting

### Common Issues
- **Authentication failures**: Check JWT_SECRET and user credentials
- **Database connection**: Verify PostgreSQL service and credentials
- **CORS errors**: Ensure frontend URL matches CORS configuration
- **TypeORM sync issues**: Check entity definitions and database schema

### Development Tips
- Use `npm run dev` for auto-restart on backend changes
- Frontend runs on port 5173, backend on 3001
- Check browser console for frontend errors
- Monitor server logs for backend issues

## Support

For issues or questions, refer to:
- Project documentation in `/docs/`
- API endpoint tests in `/scripts/`
- Database schema in `/migrations/`
