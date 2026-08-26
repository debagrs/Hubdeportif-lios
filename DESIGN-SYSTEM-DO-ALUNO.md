# DESIGN SYSTEM DO ALUNO — VERSÃO COMPLETA

A aba **Design system** gera um sistema visual independente para cada estudante. Ela não altera a aparência institucional do Hub/LabInterface.

## Cores
`background`, `surface`, `surfaceAlt`, `text`, `muted`, `accent`, `secondary`, `border`.

## Tipografia — Google Fonts
- catálogo completo consultado pelo backend em Google Fonts;
- fonte de títulos;
- fonte do corpo;
- fonte de metadados;
- pesos de 100 a 900;
- caixa, itálico, tracking;
- tamanho de corpo, entrelinha e escala de títulos.

Não é necessária chave da Google Fonts.

## Grid responsivo
- largura máxima 900 / 1100 / 1280 / 1440 px;
- 1–6 colunas no desktop;
- 1–4 no tablet;
- 1–2 no celular;
- gap;
- padding lateral;
- ritmo vertical;
- 1–6 colunas na galeria;
- projeto destacado podendo ocupar duas colunas;
- Grade, Masonry, Editorial e Pilha;
- texto abaixo, overlay ou split.

## Formas e componentes
Cards, botões, bordas, raios, sombras e estilos de superfície.

## Imagem
Proporção livre, 21:9, 16:10, 1:1 ou 3:4; `cover`/`contain`; hero split, imagem cheia ou tipográfico; altura do hero.

## Linguagem gráfica
Limpa, gradiente, grid técnico, pontos, geométrica, listras, xadrez ou linhas editoriais; navegação minimal, flutuante ou em barra; intensidade de animação.

## Ícones
Cada função do portfólio pode receber um ícone diferente. O painel pesquisa a biblioteca aberta do Iconify e também permite o envio de SVG, PNG ou WebP próprio.

Funções configuráveis: menu, projetos, sobre, contato, link externo, descer, e-mail, Instagram, LinkedIn e site.

## Arquitetura e conteúdo
Flags de visibilidade, nomes das seções, ordem das seções e rodapé continuam independentes por estudante.

## Multimídia por projeto
Além do Design System, cada projeto pode conter capa, galeria, PDF, links, p5.js ou embed externo. Veja `NOVIDADES-MULTIMIDIA.md`.

O backend valida os tokens antes de gravar para impedir injeção arbitrária de CSS no site público.
