# CHECKLIST FINAL — antes de entregar aos cinco estudantes

## GitHub / Vercel

- [ ] Projeto novo está na raiz do repositório.
- [ ] Vercel reconhece Vite.
- [ ] Build termina sem erro.
- [ ] `/api/ping` responde `ok: true`.
- [ ] `/api/backend?action=health` responde.

## Neon

- [ ] `DATABASE_URL` está na Vercel.
- [ ] `configured: true` no health.
- [ ] Login da administradora funciona.

## Cloudflare R2

- [ ] Bucket `portfolio-hub` criado.
- [ ] Token Object Read & Write criado.
- [ ] `R2_ENDPOINT` preenchido.
- [ ] `R2_ACCESS_KEY_ID` preenchido.
- [ ] `R2_SECRET_ACCESS_KEY` preenchido.
- [ ] `R2_BUCKET` preenchido.
- [ ] `R2_PUBLIC_URL` preenchido.
- [ ] CORS contém exatamente o domínio da Vercel, sem barra final.
- [ ] Upload de avatar funciona.
- [ ] Upload de capa funciona.
- [ ] Upload de várias fotos funciona.

## E-mail

- [ ] `MAIL_PROVIDER` é `resend` ou `brevo`.
- [ ] `emailConfigured: true` no health.
- [ ] Convite de estudante chega.
- [ ] Validação de e-mail funciona.
- [ ] “Esqueci minha senha” envia link.
- [ ] Link de redefinição permite criar senha nova.

## Perfis

- [ ] Administradora enxerga todos os estudantes.
- [ ] Estudante 1 não consegue editar Estudante 2.
- [ ] Cada portfólio tem URL própria.
- [ ] Alterações de cor aparecem no portfólio correto.
- [ ] Grade/editorial funcionam.
- [ ] Formato dos cards funciona.
- [ ] Projetos rascunho não aparecem no público.
- [ ] Portfólio despublicado não aparece no Hub.

## Só depois

- [ ] Criar os outros quatro estudantes.
- [ ] Remover variáveis antigas do Turso/Supabase/Blob da Vercel, se desejar.
- [ ] Manter backup do projeto anterior por segurança.
