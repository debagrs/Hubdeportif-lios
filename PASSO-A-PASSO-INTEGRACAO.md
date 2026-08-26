# PASSO A PASSO — ATUALIZAÇÃO MULTIMÍDIA DOS PORTFÓLIOS AUTORAIS

## 1. GitHub

Faça backup e substitua **todo o projeto** pela versão deste ZIP. Não misture arquivos de versões anteriores.

## 2. Neon

Não ative Data API. O projeto continua usando somente `DATABASE_URL`.

Não crie tabelas nem colunas manualmente. Ao iniciar, a API executa automaticamente:
- `attachments JSONB` nos projetos;
- `interactive JSONB` nos projetos.

Os usuários e portfólios já existentes permanecem.

## 3. Cloudinary

Mantenha as mesmas variáveis:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

O mesmo Cloudinary passa a armazenar:
- avatar;
- hero;
- capas;
- galerias;
- ícones próprios;
- PDFs.

### Única configuração extra para PDFs no plano Free

No Cloudinary, abra **Settings > Security** e habilite **Allow delivery of PDF and ZIP files**. Não exige cartão nem troca de plano. Sem isso, o upload pode ocorrer, mas o visitante não conseguirá abrir o PDF.

## 4. Vercel

Não há variável nova. Mantenha as que já funcionam:
- `DATABASE_URL`
- `HUB_ADMIN_EMAIL`
- `HUB_ADMIN_PASSWORD`
- `MAX_STUDENTS=5`
- `APP_URL`
- variáveis do Cloudinary
- Brevo ou Resend quando quiser convites/recuperação por e-mail.

Faça novo deploy após substituir o código.

## 5. Teste do Design System

Na aba **Design system**, teste:
- 4 colunas desktop / 2 tablet / 1 mobile;
- depois Masonry;
- depois Editorial;
- número de colunas da galeria;
- uma fonte Google pesquisada pelo nome;
- busca de um ícone;
- envio de um SVG/PNG/WebP próprio.

Salve e abra o portfólio público.

## 6. Teste de projeto multimídia

Na aba **Projetos**:
1. crie/edite um projeto;
2. envie capa;
3. envie várias imagens para galeria;
4. envie um PDF;
5. adicione um link externo;
6. escolha `p5.js` e cole um sketch simples;
7. escolha a posição e altura do sketch;
8. salve.

Depois confira `/portfolio/slug-do-aluno`.

## 7. Embed no LabInterface

Use `/embed/slug-do-aluno`. Essa rota mantém integralmente o Design System do estudante e não mostra links de retorno ao Hub.

## 8. E-mail

Brevo/Resend continuam independentes destas funções. Eles são necessários apenas para convite, validação de e-mail e recuperação de senha.
