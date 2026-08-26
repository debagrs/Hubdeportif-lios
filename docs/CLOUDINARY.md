# Cloudinary — configuração usada pelo Hub

O Hub usa **upload assinado**. O navegador envia a imagem diretamente ao Cloudinary, mas a assinatura é criada pela API da Vercel. O `CLOUDINARY_API_SECRET` nunca é enviado ao navegador.

Na Vercel, cadastre:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

No Cloudinary, os três valores ficam na área de **API Keys**. O botão **View API Keys** da tela de Quick Start também leva até eles.

Não é necessário criar upload preset para este projeto.
