# EMBED NO SITE DO LABINTERFACE

Cada portfólio possui duas URLs:

- pública: `https://SEU-HUB.vercel.app/portfolio/slug-do-aluno`
- embed: `https://SEU-HUB.vercel.app/embed/slug-do-aluno`

A rota `/embed/` renderiza o mesmo portfólio autoral, mas retira os links institucionais de volta ao Hub.

Quando for integrar ao site do LabInterface, use um iframe responsivo apontando para a rota `/embed/slug-do-aluno`.

Exemplo:

```html
<iframe
  src="https://SEU-HUB.vercel.app/embed/slug-do-aluno"
  title="Portfólio de Nome do Aluno"
  style="width:100%; min-height:900px; border:0;"
  loading="lazy"
></iframe>
```

O iframe não exige que o estudante tenha Vercel, GitHub, Neon ou Cloudinary próprios. O conteúdo e o Design System continuam sendo administrados pela conta individual dele no Hub.
