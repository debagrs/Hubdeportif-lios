# Hub de Portfólios — LabInterface UFSM

Projeto multiusuário para **cinco estudantes + uma administradora**, preparado para ser incorporado futuramente ao site do LabInterface.

## O que esta versão faz

- removeu totalmente a modulação por temperatura/clima;
- removeu dados, obras, currículo e seções específicas do antigo portfólio individual;
- transforma a página inicial em um **Hub com cinco portfólios independentes**;
- mantém a linguagem visual do **Design System do LabInterface**: fundo `#0A0A10`, superfícies `#1A1A30`, cyan `#00FFFF`, oat `#D2A979`, clay `#F48A79`, green `#86EFAC`, Lexend + Space Grotesk + JetBrains Mono, glass, cards escuros e raios amplos;
- cria login individual para cada estudante;
- mantém uma conta administradora capaz de criar, editar e excluir estudantes;
- impede que um estudante edite o portfólio de outro;
- inclui **Esqueci minha senha** e validação de e-mail;
- permite alterar senha dentro do painel;
- permite upload de avatar, imagem inicial, capa e várias imagens na galeria;
- converte imagens para WebP no navegador quando isso reduz o arquivo;
- usa **Neon PostgreSQL** para contas, projetos e configurações;
- usa **Cloudflare R2** para as imagens;
- usa **Resend ou Brevo** para e-mails de validação/recuperação;
- mantém GitHub + Vercel como infraestrutura de código e deploy;
- cria as tabelas do banco automaticamente na primeira chamada à API;
- oferece dois modos visuais de projeto por estudante: `grade` e `editorial`, além de cores e formato dos cards.

## Rotas

### Públicas

- `/` — Hub dos cinco portfólios
- `/portfolio/:slug` — portfólio de cada estudante

### Acesso

- `/entrar`
- `/esqueci-senha`
- `/redefinir-senha?token=...`
- `/validar-email?token=...`
- `/painel`
- `/admin` redireciona para `/entrar`

### Diagnóstico

- `/api/ping`
- `/api/backend?action=health`

## Infraestrutura

```text
GitHub
   ↓
Vercel — React/Vite + API serverless
   │
   ├── Neon PostgreSQL
   │      contas
   │      sessões
   │      tokens
   │      portfólios
   │      projetos
   │
   ├── Cloudflare R2
   │      avatar
   │      imagem inicial
   │      capas
   │      galerias
   │
   └── E-mail
          Resend OU Brevo
          validação
          recuperação de senha
```

## Começar

Leia primeiro:

**`PASSO-A-PASSO-INTEGRACAO.md`**

Depois use:

**`CHECKLIST-TESTE.md`**

As variáveis necessárias estão documentadas em **`.env.example`**.

## Importante sobre o projeto antigo

Turso, Supabase e Vercel Blob **não são usados por esta versão**. Não apague os bancos antigos antes de confirmar que o Hub novo está estável. As variáveis antigas podem ficar temporariamente na Vercel, pois este código as ignora; depois do teste final, podem ser removidas para evitar confusão.
