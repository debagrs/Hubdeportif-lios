# PASSO A PASSO — ATUALIZAÇÃO PARA PORTFÓLIOS AUTORAIS

## 1. GitHub

Substitua o projeto do Hub inteiro por esta versão. Não altere nomes de pastas.

## 2. Neon

Nenhuma Data API é necessária. O projeto continua usando apenas `DATABASE_URL`.

Nenhuma tabela nova precisa ser criada manualmente. O campo `theme JSONB` já existente recebe o Design System completo.

## 3. Cloudinary

Continuam as mesmas variáveis:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Não precisa criar upload preset.

## 4. Vercel

Mantenha:

- `DATABASE_URL`
- `HUB_ADMIN_EMAIL`
- `HUB_ADMIN_PASSWORD`
- `MAX_STUDENTS=5`
- `APP_URL`
- três variáveis do Cloudinary
- variáveis do Brevo ou Resend quando configurar o e-mail.

Depois faça um novo deploy.

## 5. Teste da administração

Entre em `/entrar` com `HUB_ADMIN_EMAIL` e `HUB_ADMIN_PASSWORD`.

Abra um estudante e confira que o menu contém:

- Conteúdo
- Design system
- Projetos
- Minha senha

A administradora também verá Estudantes e Integrações.

## 6. Teste do Design System

Na aba **Design system**, mude deliberadamente:

- fundo;
- fonte dos títulos;
- fonte do corpo;
- número de colunas;
- raio dos cards;
- hero;
- linguagem gráfica.

Clique em **Salvar design system** e depois em **Abrir resultado**.

O endereço `/portfolio/slug` deve ter aparência independente do Hub.

## 7. Teste de persistência

Saia do painel, recarregue o site e entre novamente. As escolhas devem continuar iguais. Isso confirma a gravação do JSON de tema no Neon.

## 8. Embed futuro no LabInterface

Use `/embed/slug` quando o site do LabInterface estiver pronto para receber os trabalhos em iframe. Essa rota preserva o design do estudante e esconde os links de retorno ao Hub.

## 9. E-mail

Brevo/Resend não são necessários para salvar o Design System. Eles são necessários para convites reais, validação de e-mail e recuperação de senha.
