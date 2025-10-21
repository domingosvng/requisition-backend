# Update Inventory Fields Script

## Purpose
This script fills missing fields in existing inventory items that were created with incomplete data. It ensures all items have proper values for:
- `categoria` - defaults to 'Geral'
- `unidadeMedida` - defaults to 'unidades'
- `localizacao` - defaults to 'Armazém Principal'
- `descricao` - defaults to empty string (if null)
- `status` - defaults to 'ATIVO'

## Problem
Earlier inventory items may have been added with less fields than the current form and table support, making them invisible or broken in the frontend.

## Usage

### Option 1: Using Node.js Script (Recommended)
```bash
node scripts/updateInventoryFields.js
```

This will:
1. Connect to the database
2. Find all inventory items
3. Update any items with missing fields
4. Show progress for each updated item
5. Display total count of updated items

### Option 2: Using SQL Migration
```bash
psql -U postgres -h localhost -d gestao_requisicoes_db -f migrations/0003_fill_missing_inventory_fields.sql
```

Or with environment variables:
```bash
PGPASSWORD=${DB_PASSWORD} psql -U ${DB_USERNAME} -h ${DB_HOST} -d ${DB_DATABASE} -f migrations/0003_fill_missing_inventory_fields.sql
```

## Expected Output

### Node.js Script Output
```
Database connection established
Found 4 inventory items to check
Updated item 1: Cadeira de Escritório
  - categoria: "Geral"
  - unidadeMedida: "unidades"
  - localizacao: "Armazém Principal"
Updated item 2: Monitor LCD 24"
  - categoria: "Geral"
  - unidadeMedida: "unidades"
  - localizacao: "Armazém Principal"
...
Successfully updated 4 items
```

### SQL Migration Output
```
UPDATE 4
UPDATE 4
UPDATE 4
UPDATE 0
UPDATE 0
 id |         nome          | categoria | unidadeMedida |    localizacao    | status 
----+-----------------------+-----------+---------------+-------------------+--------
  1 | Cadeira de Escritório | Geral     | unidades      | Armazém Principal | ATIVO
  2 | Monitor LCD 24"       | Geral     | unidades      | Armazém Principal | ATIVO
...
```

## Safety
- The script only updates items that have empty or null values
- Items with existing valid values are not modified
- The script is idempotent - running it multiple times is safe
- A backup of the database is recommended before running in production

## When to Use
- After discovering that old inventory items are not visible in the frontend
- When migrating from an older schema version
- After importing data from external sources that may have incomplete records
