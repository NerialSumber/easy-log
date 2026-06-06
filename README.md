
# Easy Log

Sistema web de gestão logística (TCC) — dashboard, projetos, estoque, clientes e fornecedores.

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Prisma 7 · [Neon](https://neon.tech) (PostgreSQL)

---

## Pré-requisitos

Instale antes de clonar o projeto:

| Ferramenta | Versão recomendada | Observação |
|------------|-------------------|------------|
| [Node.js](https://nodejs.org/) | 20 LTS ou superior | Necessário para Next.js, Prisma e scripts npm |
| [Git](https://git-scm.com/) | Qualquer versão recente | Para clonar e versionar o código |
| Conta no [Neon](https://neon.tech) | Gratuita | Banco PostgreSQL na nuvem usado pelo Prisma |
| [Cursor](https://cursor.com/) ou [VS Code](https://code.visualstudio.com/) | Opcional | Editor recomendado para o time |

---

## Configuração passo a passo

Siga a ordem abaixo na primeira vez que for usar o repositório.

### 1. Clonar o repositório

```bash
git clone https://github.com/mega-swampert/Easy-Log.git
cd Easy-Log
```

Se você já tem o projeto localmente, entre na pasta do projeto:

```bash
cd easy-log
```

### 2. Instalar dependências

```bash
npm install
```

Isso instala Next.js, React, Prisma, ESLint, Prettier e demais pacotes listados em `package.json`.

### 3. Configurar variáveis de ambiente (Next.js)

O Next.js carrega arquivos `.env*` automaticamente na **raiz do projeto** (não dentro de `app/`). Para segredos locais em desenvolvimento, use **`.env.local`** — padrão do Next.js e ignorado pelo Git.

Crie o arquivo na raiz:

```bash
# Git Bash
touch .env.local
```

```powershell
# PowerShell
New-Item .env.local -ItemType File
```

Cole a **connection string do Neon**. **Não use o prefixo `NEXT_PUBLIC_`**: `DATABASE_URL` fica disponível só no servidor (`process.env.DATABASE_URL` em Server Components, Route Handlers e Prisma).

```env
DATABASE_URL="postgresql://USUARIO:SENHA@ep-xxxx.sa-east-1.aws.neon.tech/neondb?sslmode=require"
```

Use a string **exata** copiada do painel do Neon (host, usuário, senha e nome do banco já vêm prontos). O parâmetro `sslmode=require` é obrigatório no Neon.

> Peça a connection string ao responsável do time se o projeto Neon for compartilhado. **Nunca commite `.env.local` nem `.env`.**
>
> O `prisma.config.ts` usa `@next/env` para carregar os mesmos arquivos `.env*` que o Next.js, então o Prisma CLI e o `npm run dev` leem a mesma `DATABASE_URL`.

### 4. Criar o projeto no Neon

1. Acesse [console.neon.tech](https://console.neon.tech) e crie uma conta (ou faça login).
2. Clique em **New Project** e escolha um nome (ex.: `easy-log`).
3. Anote a **connection string** exibida (aba **Connection Details** → **Prisma** ou **URI**).

No Neon, o banco e o usuário já vêm criados — não é preciso rodar `CREATE DATABASE` manualmente.

**Dica (Prisma + Neon):** para `prisma migrate dev`, use a connection string **sem pooler** (host começa com `ep-...`, não `-pooler`). Se o painel mostrar duas URLs, prefira a **direct / non-pooled** nas migrations.

### 5. Aplicar migrations e gerar o Prisma Client

Com `.env.local` configurado com a URL do Neon:

```bash
npx prisma migrate dev
```

Na primeira execução, isso aplica as migrations em `prisma/migrations/` e cria as tabelas no banco.

Em seguida, gere o client (saída em `app/generated/prisma`, também ignorada pelo Git):

```bash
npx prisma generate
```

> Sempre que alguém alterar `prisma/schema.prisma` ou houver migrations novas, rode de novo `npx prisma migrate dev` e `npx prisma generate`.
>
> Se alterar variáveis de ambiente depois de subir o app, reinicie o servidor (`Ctrl+C` e `npm run dev` de novo).

### 6. Subir o servidor de desenvolvimento

```bash
npm run dev
```

Abra no navegador: **http://localhost:3000**

Rotas principais hoje:

| Rota | Descrição |
|------|-----------|
| `/login` | Tela de login |
| `/` | Dashboard |
| `/projetos` | Listagem de projetos |

### 7. (Opcional) Conferir lint e formatação

```bash
npm run lint
npm run format
```

---

## Configuração do editor (Cursor / VS Code)

O repositório inclui `.vscode/settings.json` para padronizar o time:

- **Format on save** com Prettier
- **ESLint fix on save**
- **TypeScript** do próprio projeto (`node_modules/typescript`)

### Extensões obrigatórias

Instale no Cursor ou VS Code (`Ctrl+Shift+X`):

1. **Prettier - Code formatter** — `esbenp.prettier-vscode`
2. **ESLint** — `dbaeumer.vscode-eslint`

Via terminal (Cursor):

```bash
cursor --install-extension esbenp.prettier-vscode
cursor --install-extension dbaeumer.vscode-eslint
```

Depois: **Ctrl+Shift+P** → `Developer: Reload Window`.

Na primeira abertura do projeto, se aparecer o aviso para usar a versão do TypeScript do workspace, escolha **Allow** / **Sempre permitir**.

### Terminal Git Bash (opcional, só na sua máquina)

Se preferir Git Bash em vez de PowerShell no Cursor, adicione em **Configurações do usuário** (`%APPDATA%\Cursor\User\settings.json`):

```json
{
  "terminal.integrated.defaultProfile.windows": "Git Bash",
  "terminal.integrated.profiles.windows": {
    "Git Bash": {
      "path": "C:\\Program Files\\Git\\bin\\bash.exe",
      "args": ["--login", "-i"]
    }
  }
}
```

Ajuste `path` se o Git estiver em outro disco (ex.: `D:\\Git\\bin\\bash.exe`).

---

## Scripts npm

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento (hot reload) |
| `npm run build` | Build de produção |
| `npm run start` | Servidor após `build` |
| `npm run lint` | Verifica o código com ESLint |
| `npm run format` | Formata o projeto com Prettier |

### Comandos Prisma úteis

| Comando | Descrição |
|---------|-----------|
| `npx prisma migrate dev` | Aplica migrations em desenvolvimento |
| `npx prisma generate` | Gera o client em `app/generated/prisma` |
| `npx prisma studio` | Interface visual para ver/editar dados |
| `npx prisma db pull` | Atualiza o schema a partir do banco existente |

---

## Estrutura do projeto (resumo)

```
easy-log/
├── app/                 # Rotas e páginas (App Router)
│   ├── login/
│   ├── projetos/
│   └── generated/prisma # Client gerado (não commitar)
├── prisma/
│   ├── schema.prisma    # Modelos do banco
│   └── migrations/      # Histórico SQL
├── .vscode/
│   └── settings.json    # Config do editor no projeto
├── .env.local           # Variáveis locais (criar você — não commitar)
├── prisma.config.ts     # Config do Prisma (carrega .env* via @next/env)
└── package.json
```

---

## Git — fluxo básico

```bash
# Criar branch para sua feature
git checkout -b nome-da-branch

# Salvar alterações
git add .
git commit -m "Descrição do que foi feito"

# Enviar para o GitHub
git push -u origin nome-da-branch
```

Abra um Pull Request no GitHub para integrar em `main`.

---

## Checklist rápido (primeira vez)

- [ ] Node.js 20+ instalado
- [ ] Conta no Neon criada
- [ ] `git clone` feito
- [ ] `npm install` executado
- [ ] Projeto criado no Neon e connection string copiada
- [ ] Arquivo `.env.local` criado com `DATABASE_URL` do Neon
- [ ] `npx prisma migrate dev` executado sem erro
- [ ] `npx prisma generate` executado
- [ ] Extensões Prettier e ESLint instaladas no editor
- [ ] `npm run dev` abre http://localhost:3000

---

## Problemas comuns

### `DATABASE_URL` não encontrada

- Confirme que `.env.local` está na **raiz** do projeto (mesmo nível que `package.json`).
- Reinicie o terminal após criar ou editar o arquivo.
- Reinicie o `npm run dev` se o servidor já estiver rodando.

### Erro de conexão com o Neon

- A `DATABASE_URL` foi copiada inteira do painel do Neon (sem espaços ou quebras de linha)?
- A URL inclui `?sslmode=require` (ou equivalente exigido pelo Neon)?
- O projeto Neon está **Active** no console (não suspenso por inatividade no plano free)?
- Para migrations, tente a connection string **direct** (sem `-pooler` no host).

### Prettier não formata ao salvar

- Extensão `esbenp.prettier-vscode` instalada?
- Recarregue a janela do editor.
- Confira se abriu a pasta **raiz** do projeto (onde está `.vscode/`).

### Pasta `app/generated/prisma` ausente

Rode:

```bash
npx prisma generate
```

---

## Licença e projeto

Trabalho de Conclusão de Curso (TCC). Para dúvidas de ambiente ou credenciais, fale com o mantenedor do repositório no time.
