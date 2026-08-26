# Relatório de validação — versão final Cloudinary + cadastro por convite

## Alterações desta versão

- removido Cloudflare R2 e dependências AWS;
- armazenamento migrado para Cloudinary com upload assinado;
- adicionada tabela `hub_invites`;
- administradora agora **convida** em vez de criar senha de estudante;
- cada estudante cria a própria conta e a própria senha;
- adicionado `/criar-conta`;
- criação da conta é validada pelo link enviado ao e-mail autorizado;
- “Esqueci minha senha” continua disponível;
- limite de cinco considera contas ativas + convites pendentes.

## Validações locais

- JSON de `package.json` e `vercel.json` validado;
- busca por referências executáveis a R2 removidas do código;
- TypeScript foi analisado pelo compilador disponível no ambiente; a instalação das dependências externas não pôde ser concluída no ambiente isolado por timeout do registry npm.

O teste definitivo das dependências e do bundle acontece no deployment da Vercel com `npm run build`.
