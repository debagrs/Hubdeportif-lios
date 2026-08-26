# LabInterface — Hub de Portfólios Autorais

Aplicação multiusuário para cinco estudantes + administração.

## Arquitetura

- Vite + React
- Vercel Functions
- Neon PostgreSQL
- Cloudinary
- Brevo ou Resend

## Princípio de design

O **Hub** usa a identidade do LabInterface. Os **portfólios públicos não usam essa identidade**: cada estudante cria seu próprio Design System estruturado e independente.

## Funcionalidades

- convites de estudantes;
- criação de conta e senha pelo próprio estudante;
- validação por e-mail;
- recuperação de senha;
- isolamento de dados por conta;
- conteúdo, avatar, hero, contatos e projetos;
- upload de capas e galerias;
- Design System completo por estudante;
- presets visuais como ponto de partida;
- render público independente;
- rota específica para embed posterior no LabInterface;
- administração geral dos cinco portfólios.

Leia `COMECE-AQUI.md`, `DESIGN-SYSTEM-DO-ALUNO.md` e `EMBED-NO-LABINTERFACE.md`.


## Versão multimídia
Veja `NOVIDADES-MULTIMIDIA.md` para grid responsivo, p5.js, PDFs, Google Fonts e biblioteca/ upload de ícones.
