# COMECE AQUI — HUB DE PORTFÓLIOS LABINTERFACE

Esta versão separa duas coisas que não devem ser confundidas:

1. **HUB / PAINEL** — mantém a identidade visual do LabInterface.
2. **PORTFÓLIO PÚBLICO DO ESTUDANTE** — é um site autoral independente.

O estudante entra no Hub apenas para administrar conteúdo e o próprio Design System. Ao abrir `/portfolio/slug`, o site deixa de usar a aparência do LabInterface e passa a usar os tokens criados pelo estudante.

## O que o estudante controla

- paleta completa: fundo, superfícies, textos, bordas, principal e secundária;
- tipografia de títulos, corpo e etiquetas;
- pesos, caixa, itálico, tracking, escala tipográfica, corpo e entrelinha;
- largura da malha, número de colunas, gaps, margens e ritmo vertical;
- composição de projetos: grade, editorial ou lista;
- texto do projeto: abaixo, overlay ou split;
- raio de cards e botões, borda, sombra, estilo dos cards e botões;
- proporção e encaixe das imagens;
- hero tipográfico, split ou imagem cheia;
- navegação minimal, flutuante ou barra;
- linguagem gráfica: limpa, gradiente, grid, retícula ou geométrica;
- estilo e espessura dos ícones;
- intensidade das animações;
- visibilidade de ano, categoria, tags, bio, avatar e resumos;
- nomes e ordem das seções;
- texto do rodapé.

## URLs

- Hub: `/`
- Login: `/entrar`
- Painel: `/painel`
- Portfólio independente: `/portfolio/SLUG`
- Versão pronta para iframe no site do LabInterface: `/embed/SLUG`

## Banco

Não é necessário criar uma tabela nova no Neon. O Design System inteiro continua sendo salvo no campo JSONB `theme` da tabela `hub_portfolios`. Portfólios antigos são migrados automaticamente para os novos tokens quando são lidos e salvos.

## Substituição

Suba **todo o conteúdo desta pasta** no mesmo repositório do Hub e faça novo deploy da Vercel.
