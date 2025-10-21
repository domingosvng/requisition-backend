-- Migration: Add unique index on fornecedor.nif, ignore NULLs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_fornecedor_nif_unique'
    ) THEN
        CREATE UNIQUE INDEX CONCURRENTLY idx_fornecedor_nif_unique ON "fornecedor" (nif) WHERE nif IS NOT NULL;
    END IF;
END$$;