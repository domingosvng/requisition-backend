-- Migration to remove duplicate comment fields and keep only necessary ones
-- Remove unused comment columns from requisicao table

ALTER TABLE requisicao DROP COLUMN IF EXISTS "comentarioGestorDADM";
ALTER TABLE requisicao DROP COLUMN IF EXISTS "comentarioAprovacao";

-- Keep only:
-- observacoes (for general observations from requester)
-- comentarioAdmin (for admin/manager comments during approval process)
-- justificativaRejeicao (for rejection reasons)