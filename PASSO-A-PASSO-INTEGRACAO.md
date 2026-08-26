# PASSO A PASSO — HUB DE PORTFÓLIOS LABINTERFACE

Atualizado em 26 de agosto de 2026.

A ideia é fazer a migração com o mínimo de risco: **primeiro conectamos o Hub novo; só depois limpamos as ferramentas antigas**.

---

# PARTE 1 — O QUE CONTINUA E O QUE MUDA

## Continua

### GitHub
Repositório do código.

Você pode continuar usando o repositório atual:

`https://github.com/debagrs/D-bora-Aita-Gasparetto`

### Vercel
Continua fazendo o deploy do site e executando a API.

O domínio atual pode continuar funcionando durante a transição:

`https://debora-aita-gasparetto.vercel.app`

## Entra agora

### Neon
Banco PostgreSQL de contas, sessões, portfólios e projetos.

`https://console.neon.tech/`

### Cloudflare R2
Armazenamento das imagens.

`https://dash.cloudflare.com/`

### E-mail
Escolha **uma** das duas opções:

**Resend:** `https://resend.com/`

ou

**Brevo:** `https://app.brevo.com/`

O código suporta as duas.

## Sai do novo projeto

- Turso
- Supabase
- Vercel Blob
- modulação por clima/temperatura
- banco e dados do portfólio individual anterior

**Não apague nada disso ainda.** Primeiro coloque o Hub novo no ar.

---

# PARTE 2 — GITHUB

## 1. Faça uma cópia de segurança

Antes de substituir o código, baixe o repositório antigo ou mantenha o ZIP atual salvo.

## 2. Substitua o conteúdo do repositório pelo conteúdo deste projeto

Na raiz do GitHub devem aparecer diretamente arquivos como:

```text
api/
src/
docs/
.env.example
.gitignore
.vercelignore
index.html
package.json
README.md
PASSO-A-PASSO-INTEGRACAO.md
CHECKLIST-TESTE.md
tsconfig.json
vercel.json
vite.config.ts
```

Não coloque tudo dentro de uma pasta adicional.

### Atenção

Nunca envie um arquivo `.env` com senhas para o GitHub.

O arquivo `.env.example` pode ir para o GitHub porque contém apenas nomes e exemplos.

---

# PARTE 3 — NEON

## 1. Entre no Neon

Abra:

`https://console.neon.tech/`

## 2. Crie UM projeto

Nome sugerido:

`portfolio-hub`

Não crie cinco bancos. Um banco atende os cinco estudantes.

## 3. Copie a Connection String

No painel do projeto, clique em **Connect**.

Copie a URL que começa com algo semelhante a:

```text
postgresql://...
```

Normalmente ela já termina com parâmetros de SSL.

## 4. Na Vercel, crie a variável

Nome:

```text
DATABASE_URL
```

Valor:

```text
cole-a-connection-string-do-neon
```

Marque **Production**. Se quiser testar também em Preview, marque Preview.

### Não precisa criar tabelas manualmente

A API deste projeto executa `CREATE TABLE IF NOT EXISTS` automaticamente na primeira chamada.

Ela cria:

```text
hub_users
hub_sessions
hub_email_tokens
hub_portfolios
hub_projects
```

---

# PARTE 4 — CONTA ADMINISTRADORA

Ainda em **Vercel → Project → Settings → Environment Variables**, adicione:

```text
HUB_ADMIN_EMAIL
```

com o e-mail que você quer usar para administrar o Hub.

Depois:

```text
HUB_ADMIN_PASSWORD
```

com uma senha forte.

E:

```text
MAX_STUDENTS
```

valor:

```text
5
```

Na primeira execução com o Neon vazio, a conta administradora é criada automaticamente.

---

# PARTE 5 — CLOUDFLARE R2

## 1. Entre na Cloudflare

`https://dash.cloudflare.com/`

Abra **Storage & databases → R2**.

A Cloudflare pode pedir a ativação do R2 antes de criar as credenciais. O R2 possui franquia gratuita de uso, mas a Cloudflare pode solicitar dados de cobrança para ativar o serviço.

## 2. Crie um bucket

Nome sugerido:

```text
portfolio-hub
```

## 3. Crie um token S3

Na página do R2, procure **Manage R2 API Tokens**.

Crie um token com:

```text
Object Read & Write
```

Restrinja, se possível, somente ao bucket `portfolio-hub`.

Ao concluir, copie imediatamente:

```text
Access Key ID
Secret Access Key
S3 Endpoint
```

O Secret Access Key normalmente não é exibido novamente.

## 4. Torne as imagens publicamente legíveis

Para começar, você pode habilitar o **Public Development URL (`r2.dev`)** do bucket.

Copie a URL pública. Exemplo conceitual:

```text
https://pub-xxxxxxxx.r2.dev
```

Essa será `R2_PUBLIC_URL`.

Para a integração definitiva com o LabInterface, depois você pode trocar por um domínio próprio do bucket.

## 5. Crie as variáveis na Vercel

```text
R2_ENDPOINT
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET
R2_PUBLIC_URL
```

Exemplo:

```text
R2_ENDPOINT=https://SEU_ACCOUNT_ID.r2.cloudflarestorage.com
R2_BUCKET=portfolio-hub
R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev
```

`R2_ACCOUNT_ID` é opcional quando `R2_ENDPOINT` já está preenchido.

## 6. Configure o CORS

No bucket:

**Settings → CORS Policy → Add CORS policy → JSON**

Cole:

```json
[
  {
    "AllowedOrigins": [
      "https://debora-aita-gasparetto.vercel.app",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

O arquivo `docs/R2-CORS.json` contém a mesma configuração.

### Muito importante

A origem precisa ser exata:

CORRETO:

```text
https://debora-aita-gasparetto.vercel.app
```

ERRADO:

```text
https://debora-aita-gasparetto.vercel.app/
```

Quando o Hub ganhar outro domínio, acrescente o novo domínio em `AllowedOrigins`.

---

# PARTE 6 — E-MAIL: RESEND OU BREVO

O Hub precisa enviar dois tipos de mensagem:

1. validação do primeiro acesso;
2. link de “Esqueci minha senha”.

## OPÇÃO A — RESEND

Use esta opção se você tiver um domínio próprio que possa configurar no DNS.

### 1. Entre

`https://resend.com/`

### 2. Adicione e verifique um domínio

O Resend exige um domínio verificado para enviar mensagens a endereços diferentes do e-mail da própria conta.

Depois crie uma API Key.

### 3. Vercel

```text
MAIL_PROVIDER=resend
RESEND_API_KEY=re_...
RESEND_FROM=Portfolios LabInterface <portfolio@SEU-DOMINIO.com>
```

## OPÇÃO B — BREVO

Use esta opção se você **não tiver domínio próprio** e quiser validar um endereço remetente por e-mail.

### 1. Entre

`https://app.brevo.com/`

### 2. Cadastre um remetente

Use um e-mail que você controla e conclua a validação recebida nesse endereço.

### 3. Crie uma API Key

No painel da Brevo, procure a área de **SMTP & API / API Keys**.

### 4. Vercel

```text
MAIL_PROVIDER=brevo
BREVO_API_KEY=...
BREVO_SENDER_EMAIL=seu-email-remetente@...
BREVO_SENDER_NAME=Portfolios LabInterface
```

Você pode deixar as variáveis do Resend vazias quando estiver usando Brevo.

---

# PARTE 7 — URL DO HUB

Na Vercel adicione:

```text
APP_URL
```

Durante esta primeira fase:

```text
https://debora-aita-gasparetto.vercel.app
```

Sem `/` no final.

Quando o Hub for integrado ao Laboratório e o endereço mudar, altere `APP_URL` e faça novo deploy.

---

# PARTE 8 — LISTA COMPLETA DE VARIÁVEIS DA VERCEL

## Obrigatórias

```text
DATABASE_URL
HUB_ADMIN_EMAIL
HUB_ADMIN_PASSWORD
MAX_STUDENTS
APP_URL
R2_ENDPOINT
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET
R2_PUBLIC_URL
MAIL_PROVIDER
```

## Se usar Resend

```text
RESEND_API_KEY
RESEND_FROM
```

## Se usar Brevo

```text
BREVO_API_KEY
BREVO_SENDER_EMAIL
BREVO_SENDER_NAME
```

---

# PARTE 9 — VERCEL

O projeto já inclui `vercel.json`.

Confirme:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Root Directory: raiz do repositório
```

Depois das variáveis de ambiente, faça um **novo deployment**.

Alterações em Environment Variables não alteram deployments antigos: é necessário redeploy.

---

# PARTE 10 — TESTAR NA ORDEM CERTA

## Teste 1

Abra:

```text
https://debora-aita-gasparetto.vercel.app/api/ping
```

Esperado:

```json
{
  "ok": true,
  "runtime": "vercel-node",
  "app": "labinterface-portfolio-hub"
}
```

## Teste 2

Abra:

```text
https://debora-aita-gasparetto.vercel.app/api/backend?action=health
```

Quando tudo estiver pronto, deve retornar aproximadamente:

```json
{
  "ok": true,
  "configured": true,
  "emailConfigured": true,
  "storageConfigured": true,
  "mailProvider": "resend"
}
```

ou:

```json
"mailProvider": "brevo"
```

## Teste 3

Abra:

```text
/entrar
```

Entre com:

```text
HUB_ADMIN_EMAIL
HUB_ADMIN_PASSWORD
```

## Teste 4

No painel:

```text
Integrações
```

Os três devem aparecer como ATIVO:

```text
Neon
Cloudflare R2
Resend/Brevo
```

## Teste 5

Crie apenas **um estudante de teste** primeiro.

Confira:

- recebeu e-mail;
- link de validação funciona;
- login funciona;
- “Esqueci minha senha” chega por e-mail;
- consegue trocar senha;
- consegue fazer upload de avatar;
- consegue fazer upload de imagem inicial;
- consegue criar projeto;
- consegue enviar capa;
- consegue selecionar várias fotos na galeria;
- imagens aparecem na página pública.

Somente depois crie os outros quatro estudantes.

---

# PARTE 11 — O QUE FAZER COM TURSO, SUPABASE E VARIÁVEIS ANTIGAS

Só depois que todos os testes acima funcionarem.

Na Vercel, variáveis antigas como estas não são usadas pelo Hub novo:

```text
TURSO_DATABASE_URL
TURSO_AUTH_TOKEN
ADMIN_EMAIL
ADMIN_PASSWORD
SESSION_SECRET
BLOB_READ_WRITE_TOKEN
```

Você pode removê-las depois da migração para não confundir manutenção futura.

### Não precisa apagar o banco Turso imediatamente

Ele pode ficar como backup do projeto anterior até você ter certeza de que nada precisa ser recuperado.

### Supabase

Não é necessário para este Hub.

---

# PARTE 12 — COMO OS CINCO ALUNOS USAM

Eles **não precisam** entrar em:

- GitHub;
- Vercel;
- Neon;
- Cloudflare;
- Resend/Brevo.

Eles recebem apenas:

```text
URL do Hub
E-mail
Senha temporária
```

Fluxo:

```text
recebe convite
   ↓
confirma e-mail
   ↓
entra em /entrar
   ↓
edita identidade
   ↓
faz upload das imagens
   ↓
cadastra projetos
   ↓
publica
```

Cada estudante pode alterar:

- nome;
- frase de apresentação;
- bio;
- texto “sobre”;
- avatar;
- imagem inicial;
- contatos;
- cor principal;
- cor secundária;
- arredondamento dos cards;
- layout em grade ou editorial;
- projetos;
- capas;
- galerias;
- tags;
- links externos.

---

# PARTE 13 — INTEGRAÇÃO FUTURA COM O LABINTERFACE

O Hub já usa os tokens visuais do LabInterface.

Quando for incorporar ao site do Laboratório, o ideal é manter as rotas do Hub sob algo como:

```text
/portfolios
/portfolios/:slug
/portfolios/entrar
/portfolios/painel
```

A infraestrutura Neon/R2/e-mail não precisa mudar. A integração futura será principalmente de roteamento e composição do front-end.
