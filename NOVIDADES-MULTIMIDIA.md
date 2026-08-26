# Portfólios Autorais — Grid, multimídia, fontes e ícones

Esta versão amplia o portfólio de cada estudante sem alterar a arquitetura de contas já funcionando.

## O que passou a funcionar

### Grid responsivo
Cada estudante controla separadamente:
- 1 a 6 colunas no desktop;
- 1 a 4 colunas no tablet;
- 1 ou 2 colunas no celular;
- gap;
- largura máxima;
- padding lateral;
- colunas da galeria;
- projetos destacados ocupando duas colunas;
- layouts Grade, Masonry, Editorial e Pilha.

### Imagens
Continuam disponíveis uploads para:
- avatar;
- imagem de abertura;
- capa do projeto;
- galeria com várias imagens.

As imagens usam o Cloudinary já configurado. Não é necessário criar outro serviço.

### PDF e links
Em cada projeto é possível:
- enviar PDF de até 15 MB;
- adicionar quantos links forem necessários;
- editar título e URL;
- remover anexos;
- exibir os anexos como elementos do próprio design system.

**Cloudinary Free:** para o PDF abrir publicamente, entre em Cloudinary > Settings > Security e habilite **Allow delivery of PDF and ZIP files**. Isso é uma configuração da conta gratuita, não exige plano pago.

### p5.js e conteúdo interativo
Em cada projeto existe a seção **Interatividade / creative coding**. O estudante pode:
- escolher `p5.js`;
- colar somente o JavaScript do sketch;
- definir a altura;
- escolher onde o sketch aparece;
- ou escolher `Embed por URL` para incorporar um projeto externo.

O p5.js roda dentro de `iframe sandbox`, isolado do painel e das sessões do Hub.

### Google Fonts
O painel consulta o catálogo do Google Fonts pelo backend e permite buscar qualquer família pelo nome. Não precisa de chave da API Google Fonts.

Cada estudante escolhe independentemente:
- fonte dos títulos;
- fonte do corpo;
- fonte de metadados;
- peso;
- caixa;
- itálico;
- tracking;
- tamanho;
- entrelinha;
- escala dos títulos.

### Ícones
O painel pesquisa a biblioteca aberta do Iconify, sem ficar preso a um único pacote de ícones.

Cada função pode receber um ícone diferente: menu, projetos, sobre, contato, link externo, seta, e-mail, Instagram, LinkedIn e site.

Além disso, o estudante pode enviar seu próprio ícone em:
- SVG;
- PNG;
- WebP.

O ícone próprio substitui o ícone da biblioteca somente naquela função.

## Banco de dados
Não recrie o Neon. A API executa automaticamente as migrações para adicionar `attachments` e `interactive` aos projetos existentes.

## Variáveis
Nenhuma variável nova é necessária. Continuam as mesmas variáveis do Hub (Neon, Cloudinary e e-mail).
