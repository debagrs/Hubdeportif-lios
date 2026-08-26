# Hub de Portfólios — LabInterface

Projeto multiusuário para até **5 estudantes**, com uma conta administradora geral e um portfólio independente para cada estudante.

## Arquitetura

- **GitHub** — código-fonte central.
- **Vercel** — front-end Vite/React + API serverless.
- **Neon PostgreSQL** — contas, convites, sessões, portfólios e projetos.
- **Cloudinary** — imagens, capas e galerias.
- **Brevo** (recomendado) ou Resend — convites e recuperação de senha.

## Fluxo de conta dos estudantes

1. A administradora informa apenas o e-mail do estudante em **Painel → Estudantes**.
2. O Hub envia um convite.
3. O estudante abre **Criar minha conta**.
4. O link recebido por e-mail valida que o e-mail é dele.
5. O estudante escolhe **nome público, URL do portfólio e a própria senha**.
6. A conta e o portfólio são criados automaticamente.
7. Depois disso ele entra em `/entrar` e só pode alterar o próprio portfólio.

Não há senha temporária e a administradora não precisa saber a senha dos estudantes.

## Segurança

- senhas com `scrypt` + salt;
- sessão em cookie `HttpOnly`, `SameSite=Lax`;
- convite com token aleatório armazenado somente como SHA-256;
- recuperação de senha com token de uso único;
- autorização por proprietário em portfólios e projetos;
- upload Cloudinary assinado no servidor;
- `CLOUDINARY_API_SECRET` nunca vai para o navegador;
- nenhuma chave deve ser commitada no GitHub.

## Design System

A interface do Hub usa a linguagem visual do LabInterface: fundo escuro, Lexend/Space Grotesk, cyan, oat, clay e green, cards técnicos arredondados e hierarquia tipográfica em caixa alta.

## Comandos

```bash
npm install
npm run typecheck
npm run build
```

## Variáveis

Copie os nomes de `.env.example` para **Vercel → Project → Settings → Environment Variables**. Nunca envie os valores secretos para o GitHub.

## Rotas

- `/` — Hub público.
- `/entrar` — login.
- `/criar-conta` — criação de conta por convite.
- `/esqueci-senha` — recuperação.
- `/redefinir-senha` — nova senha via token.
- `/painel` — painel autenticado.
- `/portfolio/:slug` — portfólio público de cada estudante.
