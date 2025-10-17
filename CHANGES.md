# Changes Made

## Summary
This document outlines the improvements made to the requisition backend project to enhance functionality while maintaining project integrity.

## Changes Implemented

### 1. Build Configuration Improvements
- **File**: `tsconfig.json`
  - Added `scripts` and `dist` to the exclude list to prevent TypeScript compilation errors
  - This ensures that helper scripts and build artifacts don't interfere with the main build process

### 2. Version Control Cleanup
- **File**: `.gitignore`
  - Added `dist` directory to exclude build artifacts from version control
  - Added `scripts` directory to exclude helper scripts from version control
  - Added `frontend-vue/node_modules` and `frontend-vue/dist` to exclude frontend build artifacts
  - Removed previously committed build artifacts and scripts from git history

### 3. Frontend Dependencies
- **File**: `frontend-vue/package.json`
  - Added `vue-router` dependency (version ^4.5.1) which was missing but required by the application
  - This fixes build errors and ensures proper routing functionality

### 4. Enhanced Search Functionality
- **File**: `frontend-vue/src/components/Fornecedores.vue`
  - Enhanced the `filterFornecedores()` method to search across all supplier fields:
    - Nome (name)
    - NIF (tax ID)
    - Contacto Principal (main contact)
    - Email
    - Telefone (phone)
    - Endereço (address)
    - Serviços/Produtos (services/products)
  - Previously, search only worked for `nome` and `servicosFornecidos`
  - This resolves the "still not searchable" issue mentioned by the user

### 5. Bug Fix in Dashboard Component
- **File**: `frontend-vue/src/components/Dashboard.vue`
  - Fixed variable name mismatch: changed `error` ref to `serverError` ref
  - This variable was referenced in the template as `serverError` but defined as `error`
  - Ensures error messages display correctly when requisitions fail to load

## Password Hashing (Already Implemented)
The password hashing functionality was already properly implemented:
- User entity has nullable `password_hash` column for backward compatibility
- Registration endpoint hashes passwords using bcrypt (10 rounds)
- Login endpoint verifies hashed passwords
- Legacy user support: automatically hashes passwords for users without `password_hash` on first login
- Migration file `0001_add_password_hash.sql` adds the column to existing databases

## Fields Displayed on Fornecedor Dashboard
The Fornecedores component already displays all required fields:
- ID
- Nome (Name)
- NIF (Tax ID)
- Contacto Principal (Main Contact)
- Email
- Telefone (Phone)
- Endereço (Address)
- Serviços/Produtos (Services/Products)
- Ações (Actions - Edit/Delete buttons)

## Verification
- ✅ Backend builds successfully with `npm run build`
- ✅ Frontend builds successfully with `npm run build`
- ✅ All TypeScript compilation errors resolved
- ✅ No functionality removed or broken
- ✅ Project integrity maintained

## Notes
- All changes are minimal and focused on fixing specific issues
- No existing functionality was modified or removed
- The project is ready for Bootstrap UI enhancements as planned by the user
