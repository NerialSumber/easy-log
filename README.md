# Easy Log

Sistema web para controle de uma marcenaria: projetos, estoque, fornecedores e usuários, com um painel de visão geral. Desenvolvido como Trabalho de Conclusão de Curso (TCC).

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Prisma 7 · PostgreSQL ([Neon](https://neon.tech))

## Funcionalidades

- **Visão geral:** projetos ativos, atrasos, entregas da semana, madeira em uso, gráficos por mês e alertas de estoque.
- **Projetos:** lista de pedidos com busca e filtros, catálogo dos modelos mais feitos, edição e conclusão. Cada projeto informa o tipo e a quantidade de madeira.
- **Estoque:** madeira, produtos químicos e EPIs, com registro de entradas e saídas. A aba de madeira mostra quanto está reservado para os projetos ativos. Ao concluir um projeto, a madeira usada é descontada do estoque automaticamente.
- **Fornecedores:** contatos, endereço e produtos de cada fornecedor.
- **Usuários:** cadastro de acessos com dois perfis, Administrador e Projetista.
- **Minha conta:** alterar nome, e-mail e senha, tema noturno e fonte maior.

O Projetista vê o painel, os fornecedores e trabalha nos projetos. Estoque e usuários são exclusivos do Administrador.

Todas as telas funcionam no celular, no tablet e no computador, com ou sem o tema noturno e a fonte maior. Em telas menores, o menu lateral vira um botão no topo da página.

## Como rodar

Pré-requisitos: [Node.js](https://nodejs.org/) 20.19+, 22.12+ ou 24+, e um banco PostgreSQL (uma conta gratuita no Neon serve).

```bash
git clone https://github.com/NerialSumber/easy-log.git
cd easy-log
npm install
```

Crie o arquivo `.env.local` a partir do modelo e preencha a `DATABASE_URL`:

```bash
cp .env.example .env.local          # Git Bash / macOS / Linux
Copy-Item .env.example .env.local   # PowerShell
```

Aplique as migrations e suba o servidor:

```bash
npm run db:migrate
npm run dev
```

O sistema abre em [http://localhost:3000](http://localhost:3000).

### Primeiro acesso

Não existe tela de cadastro: as contas são criadas pelo Administrador em **Usuários**. Em um banco novo, crie o primeiro Administrador direto no banco.

1. Gere a senha criptografada (troque `admin123` pela senha desejada):

   ```bash
   node -e "const c=require('crypto');const s=c.randomBytes(16).toString('hex');console.log(s+':'+c.scryptSync('admin123',s,64).toString('hex'))"
   ```

2. Rode `npm run db:studio`, abra a tabela **Usuario** e adicione uma linha com `nome`, `email`, `senha` (o texto gerado acima) e `role` igual a `ADMIN`.
3. Entre no sistema com esse e-mail e a senha escolhida.

### Atualizando o projeto

Depois de puxar mudanças do repositório (`git pull`), rode de novo:

```bash
npm install
npm run db:migrate
```

Assim o banco recebe as migrations novas, como a que liga cada projeto a um tipo de madeira.

### Variáveis de ambiente

| Variável       | Obrigatória | Descrição                                                         |
| -------------- | ----------- | ----------------------------------------------------------------- |
| `DATABASE_URL` | Sim         | Connection string do PostgreSQL, com `sslmode=require` no Neon.   |
| `AUTH_SECRET`  | Não         | Segredo que assina o cookie de sessão. Use um texto longo.        |

No Neon, use a connection string **direta** (o host começa com `ep-` e não tem `-pooler`) para rodar as migrations.

## Rotas

| Rota                 | Tela                      |
| -------------------- | ------------------------- |
| `/login`             | Entrada no sistema        |
| `/`                  | Visão geral               |
| `/projetos`          | Pedidos e catálogo        |
| `/projetos/novo`     | Novo projeto              |
| `/estoque`           | Controle de estoque       |
| `/fornecedores`      | Lista de fornecedores     |
| `/fornecedores/novo` | Novo fornecedor           |
| `/usuarios`          | Gerenciamento de usuários |

## Estrutura de pastas

```
easy-log/
├── app/
│   ├── page.tsx              # Visão geral
│   ├── _components/          # Cartões e gráficos da visão geral
│   ├── login/
│   ├── projetos/
│   │   ├── page.tsx
│   │   ├── _components/      # Pedidos, catálogo, detalhes e edição
│   │   ├── _lib/             # Regras de busca e filtro
│   │   └── novo/
│   ├── estoque/
│   │   ├── page.tsx
│   │   └── _components/      # Tabela, novo item, edição e movimentação
│   ├── fornecedores/
│   │   ├── page.tsx
│   │   ├── _components/      # Formulário e detalhes do fornecedor
│   │   └── novo/
│   ├── usuarios/
│   │   ├── page.tsx
│   │   └── _components/      # Formulário de usuário
│   └── api/                  # Rotas do backend (uma pasta por recurso)
├── components/               # Peças usadas em várias telas
│   ├── app-shell.tsx         # Layout com menu lateral e rodapé
│   ├── menu-mobile.tsx       # Menu do topo em celulares e tablets
│   ├── modal.tsx             # Janela modal padrão
│   ├── campo.tsx             # Campo de formulário e estilos de botão
│   ├── abas.tsx
│   └── user-settings/        # Janela "Minha conta"
├── lib/                      # Regras de negócio e utilitários
│   ├── api.ts                # Chamadas ao backend a partir das telas
│   ├── auth.ts               # Sessão, senha e permissões no servidor
│   ├── current-user.ts       # Usuário logado nas telas
│   ├── dashboard.ts          # Cálculos da visão geral
│   ├── permissoes.ts         # O que cada perfil pode fazer
│   └── ...
└── prisma/
    ├── schema.prisma         # Modelos do banco
    └── migrations/
```

Pastas que começam com `_` ficam ao lado da tela que as usa e não viram rotas.

## Scripts

| Comando               | Descrição                              |
| --------------------- | -------------------------------------- |
| `npm run dev`         | Servidor de desenvolvimento            |
| `npm run build`       | Build de produção                      |
| `npm run start`       | Servidor de produção (após o build)    |
| `npm run lint`        | Verifica o código com ESLint           |
| `npm run format:fix`  | Formata o código com Prettier          |
| `npm run db:migrate`  | Aplica as migrations no banco          |
| `npm run db:generate` | Gera o Prisma Client                   |
| `npm run db:studio`   | Abre o Prisma Studio                   |

O editor já vem configurado em `.vscode/` para formatar ao salvar. As extensões recomendadas são Prettier, ESLint e Prisma.

## Problemas comuns

**`DATABASE_URL` não encontrada:** confira se o `.env.local` está na raiz do projeto, ao lado do `package.json`, e reinicie o `npm run dev`.

**Erro de conexão com o banco:** copie a connection string inteira do painel do Neon e verifique se o projeto não está suspenso por inatividade.

**`@prisma/client` não encontrado:** rode `npm run db:generate`.

**Não consigo concluir um projeto:** o projeto precisa ter um tipo de madeira escolhido, e esse tipo precisa ter quantidade suficiente no estoque. A mensagem na janela do projeto diz qual dos dois falta.
