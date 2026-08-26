# PASSO A PASSO — Hub de Portfólios LabInterface

Este arquivo corresponde à versão **Neon + Cloudinary + Brevo/Resend + Vercel + GitHub**.
Não use Cloudflare R2 neste projeto.

---

## 1. GitHub

Use o repositório central do Hub. Faça um backup do conteúdo atual e depois substitua **todo o conteúdo** pelo conteúdo deste projeto.

Não envie `.env` nem chaves secretas ao GitHub.

---

## 2. Neon — banco

Crie **um único projeto** no Neon para os cinco estudantes.

No painel do Neon, copie a **connection string PostgreSQL** do banco. Ela será usada como:

```text
DATABASE_URL
```

Você não precisa criar tabelas manualmente. A primeira chamada à API cria automaticamente:

```text
hub_users
hub_sessions
hub_email_tokens
hub_invites
hub_portfolios
hub_projects
```

---

## 3. Cloudinary — imagens

Você já está no Cloudinary. Na tela de Quick Start, clique em **View API Keys**.

Copie para um lugar temporário e seguro:

```text
Cloud name
API Key
API Secret
```

Na Vercel eles serão cadastrados como:

```text
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

**Não me envie o API Secret e não coloque no GitHub.**

O projeto NÃO precisa de Cloudflare, bucket R2, CORS de R2 ou cartão de crédito.

Também não é necessário criar upload preset: o Hub usa upload assinado.

---

## 4. E-mail — Brevo recomendado

Para convite, “Criar minha conta” e “Esqueci minha senha”, o Hub precisa enviar e-mail.

Configuração recomendada:

```text
MAIL_PROVIDER=brevo
BREVO_API_KEY=...
BREVO_SENDER_EMAIL=seu-email-validado
BREVO_SENDER_NAME=Portfolios LabInterface
```

Se você já preferir Resend, o projeto também aceita:

```text
MAIL_PROVIDER=resend
RESEND_API_KEY=...
RESEND_FROM=Portfolios LabInterface <email-de-remetente>
```

Preencha somente um provedor.

---

## 5. Vercel — variáveis

Abra:

**Project → Settings → Environment Variables**

Cadastre:

```text
DATABASE_URL
HUB_ADMIN_EMAIL
HUB_ADMIN_PASSWORD
MAX_STUDENTS
APP_URL
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
MAIL_PROVIDER
```

Se usar Brevo:

```text
BREVO_API_KEY
BREVO_SENDER_EMAIL
BREVO_SENDER_NAME
```

Se usar Resend:

```text
RESEND_API_KEY
RESEND_FROM
```

Use:

```text
MAX_STUDENTS=5
```

E em `APP_URL`, use a URL final sem barra no fim, por exemplo:

```text
https://seu-projeto.vercel.app
```

Depois de cadastrar ou alterar qualquer variável, faça **novo deployment**.

---

## 6. Primeiro teste

Abra:

```text
https://SEU-SITE.vercel.app/api/ping
```

Depois:

```text
https://SEU-SITE.vercel.app/api/backend?action=health
```

Quando tudo estiver ligado, o JSON deve indicar:

```text
configured: true
storageConfigured: true
emailConfigured: true
```

---

## 7. Entrar como administradora

Abra:

```text
/entrar
```

Use exatamente o e-mail e a senha que você cadastrou como:

```text
HUB_ADMIN_EMAIL
HUB_ADMIN_PASSWORD
```

A conta administradora é criada automaticamente no primeiro uso do banco.

---

## 8. Convidar o primeiro aluno

No painel:

**Estudantes → Convidar estudante**

Você informa:

- nome opcional, apenas para identificar o convite;
- e-mail do estudante.

Clique em **Enviar convite**.

O aluno ainda NÃO existe como conta. Ele aparece em **Convites pendentes**.

---

## 9. O aluno cria a própria conta

O estudante recebe um e-mail e clica em **Criar minha conta**.

Na página ele define:

```text
nome público
/portfolio/seu-endereco
senha
confirmar senha
```

O link recebido no e-mail é a validação daquele endereço de e-mail.

Quando ele conclui:

- a conta é criada;
- o portfólio é criado;
- o convite é marcado como utilizado;
- o e-mail já fica validado;
- ele entra automaticamente no painel.

Nenhuma senha temporária é criada.

---

## 10. Se o aluno abrir “Criar minha conta” sem o link

Na tela de login há **Criar minha conta**.

Ele informa o e-mail. Se esse e-mail estiver entre os convites pendentes, o Hub envia um novo link.

A resposta da tela é neutra para não revelar quais e-mails estão cadastrados.

---

## 11. Esqueci minha senha

Na tela `/entrar`, o aluno clica em **Esqueci minha senha**.

O sistema envia um link temporário para `/redefinir-senha`.

O token:

- expira em 30 minutos;
- só funciona uma vez;
- é armazenado no banco apenas como hash.

---

## 12. Upload de imagens

O painel permite upload de:

- avatar;
- imagem inicial;
- capa de projeto;
- várias imagens na galeria.

Antes do envio, o navegador tenta reduzir imagens grandes para WebP. Depois solicita uma assinatura segura à API da Vercel e envia a imagem diretamente ao Cloudinary.

O segredo do Cloudinary nunca é exposto ao aluno.

---

## 13. Depois que o primeiro aluno funcionar

Somente então convide os outros quatro.

O Hub impede ultrapassar cinco posições, contando:

```text
contas de estudantes ativas
+
convites pendentes
```

---

## 14. Ferramentas antigas

Este Hub novo NÃO usa:

```text
Turso
Supabase
Cloudflare R2
Vercel Blob
```

Você pode manter variáveis antigas na Vercel durante os primeiros testes porque o novo código simplesmente não as lê. Depois que tudo estiver confirmado, pode removê-las para deixar o projeto limpo.

---

## 15. Ordem mais segura

```text
1. GitHub
2. Neon
3. Cloudinary
4. Brevo/Resend
5. Variáveis da Vercel
6. Redeploy
7. /api/ping
8. /api/backend?action=health
9. login administradora
10. convidar UM aluno
11. aluno cria a própria conta
12. testar upload
13. testar esqueci senha
14. convidar os outros quatro
```
