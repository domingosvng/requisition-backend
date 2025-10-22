Requisition Backend

This repository contains the backend (TypeScript + TypeORM) and a Vue frontend (frontend-vue).

Quick steps to get started (Windows PowerShell):

1) Clone the repository and change directory:
   git clone https://github.com/domingosvng/requisition-backend.git
   cd requisition-backend

2) Copy the env example and edit it with your DB credentials:
   copy .env.example .env
   # then open .env in an editor and set DB_PASSWORD and JWT_SECRET

3) Install dependencies:
   npm install
   cd frontend-vue
   npm install

4) Run the backend in dev mode (from repo root):
   npm run dev

5) Run the frontend (from frontend-vue):
   npm run dev

6) Build for production:
   cd frontend-vue
   npm run build
   cd ..
   npm run build

If you want me to scaffold TypeORM migrations, seed files, or a sanitize script for DB dumps, tell me and I'll prepare them.
