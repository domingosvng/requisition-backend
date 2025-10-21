-- Migration: Fill missing fields in existing inventory items
-- This script updates inventory items that have empty or null values
-- for categoria, unidadeMedida, and localizacao with sensible defaults.

-- Update categoria for items with empty or null values
UPDATE item_inventario
SET categoria = 'Geral'
WHERE categoria IS NULL OR categoria = '';

-- Update unidadeMedida for items with empty or null values
UPDATE item_inventario
SET "unidadeMedida" = 'unidades'
WHERE "unidadeMedida" IS NULL OR "unidadeMedida" = '';

-- Update localizacao for items with empty or null values
UPDATE item_inventario
SET localizacao = 'Armazém Principal'
WHERE localizacao IS NULL OR localizacao = '';

-- Update descricao for items with null values (set to empty string)
UPDATE item_inventario
SET descricao = ''
WHERE descricao IS NULL;

-- Update status for items with empty or null values
UPDATE item_inventario
SET status = 'ATIVO'
WHERE status IS NULL OR status = '';

-- Show results
SELECT id, nome, categoria, "unidadeMedida", localizacao, status
FROM item_inventario
ORDER BY id;
