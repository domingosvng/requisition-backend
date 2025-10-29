-- Add fornecedorNome column to ItemInventario table
-- This allows storing supplier names as strings without requiring formal supplier entities

ALTER TABLE item_inventario 
ADD COLUMN fornecedor_nome VARCHAR(255) NULL;

-- Add a comment explaining the purpose
COMMENT ON COLUMN item_inventario.fornecedor_nome IS 'Supplier name as string when not using formal Fornecedor entity';