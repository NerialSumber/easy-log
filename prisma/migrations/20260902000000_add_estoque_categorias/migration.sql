CREATE TYPE "CategoriaEstoque" AS ENUM ('MADEIRA', 'QUIMICO', 'EPI');

ALTER TABLE "ItemEstoque"
  ALTER COLUMN "quantidade" TYPE DOUBLE PRECISION USING "quantidade"::DOUBLE PRECISION;

ALTER TABLE "ItemEstoque"
  ADD COLUMN "categoria" "CategoriaEstoque" NOT NULL DEFAULT 'MADEIRA';
