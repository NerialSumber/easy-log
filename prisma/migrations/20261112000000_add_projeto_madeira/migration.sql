ALTER TABLE "Projeto" ADD COLUMN "madeiraId" TEXT;

ALTER TABLE "Projeto" ADD CONSTRAINT "Projeto_madeiraId_fkey" FOREIGN KEY ("madeiraId") REFERENCES "ItemEstoque"("id") ON DELETE SET NULL ON UPDATE CASCADE;
