ALTER TABLE "Fornecedor" ADD COLUMN "telefone" TEXT;
ALTER TABLE "Fornecedor" ADD COLUMN "email" TEXT;
ALTER TABLE "Fornecedor" ADD COLUMN "endereco" TEXT;
ALTER TABLE "Fornecedor" ALTER COLUMN "produto" TYPE TEXT[] USING CASE
  WHEN "produto" IS NULL OR "produto" = '' THEN ARRAY[]::TEXT[]
  ELSE ARRAY["produto"]
END;
ALTER TABLE "Fornecedor" ALTER COLUMN "produto" SET DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Fornecedor" ALTER COLUMN "produto" SET NOT NULL;