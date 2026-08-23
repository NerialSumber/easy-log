-- AlterEnum
ALTER TYPE "StatusProjeto" ADD VALUE 'ATRASADO';

-- AlterTable
ALTER TABLE "Projeto" ADD COLUMN "dataInicio" TIMESTAMP(3);
ALTER TABLE "Projeto" ADD COLUMN "dataFim" TIMESTAMP(3);

UPDATE "Projeto"
SET
  "dataInicio" = DATE_TRUNC('day', "criadoEm"),
  "dataFim" = DATE_TRUNC('day', "criadoEm") + INTERVAL '7 days'
WHERE "dataInicio" IS NULL;
