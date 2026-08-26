# Checklist final — Hub de Portfólios LabInterface

## Antes do deploy

- [ ] ZIP substituído integralmente no GitHub.
- [ ] `package.json` não contém dependências AWS/R2.
- [ ] `.env.example` contém Cloudinary, Neon e e-mail.

## Vercel

- [ ] `DATABASE_URL`
- [ ] `HUB_ADMIN_EMAIL`
- [ ] `HUB_ADMIN_PASSWORD`
- [ ] `MAX_STUDENTS=5`
- [ ] `APP_URL`
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `MAIL_PROVIDER=brevo` (ou `resend`)
- [ ] credenciais do provedor de e-mail
- [ ] novo deployment depois de alterar variáveis

## Teste técnico

- [ ] `/api/ping` responde JSON.
- [ ] `/api/backend?action=health` mostra `configured:true`.
- [ ] `storageConfigured:true` quando Cloudinary estiver pronto.
- [ ] `emailConfigured:true` quando Brevo/Resend estiver pronto.

## Teste de administração

- [ ] login da administradora funciona.
- [ ] Painel → Estudantes mostra **Convidar estudante**.
- [ ] convite chega por e-mail.
- [ ] convite aparece como pendente até o aluno criar a conta.

## Teste do estudante

- [ ] abre o link recebido.
- [ ] cria nome, slug e a própria senha.
- [ ] entra automaticamente no painel.
- [ ] consegue sair e entrar novamente.
- [ ] “Esqueci minha senha” envia e-mail.
- [ ] só enxerga o próprio portfólio.

## Imagens

- [ ] avatar faz upload.
- [ ] imagem inicial faz upload.
- [ ] capa de projeto faz upload.
- [ ] galeria aceita várias imagens.
- [ ] URLs salvas começam com `https://res.cloudinary.com/`.

## Público

- [ ] `/` mostra os portfólios ativos.
- [ ] `/portfolio/slug-do-aluno` abre corretamente.
- [ ] cada estudante pode ter cores/layout próprios.
