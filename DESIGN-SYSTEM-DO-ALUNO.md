# DESIGN SYSTEM DO ALUNO

O painel do estudante agora tem uma aba própria chamada **Design system**.

Ela não altera o Design System institucional do LabInterface. Ela gera um conjunto de tokens individual, salvo no Neon dentro do portfólio daquele estudante.

## Estrutura dos tokens

### Cores
`background`, `surface`, `surfaceAlt`, `text`, `muted`, `accent`, `secondary`, `border`.

### Tipografia
`headingFont`, `bodyFont`, `monoFont`, `headingWeight`, `bodyWeight`, `headingCase`, `headingStyle`, `headingTracking`, `bodySize`, `bodyLeading`, `headingScale`.

### Grid
`contentWidth`, `gridColumns`, `gridGap`, `sectionGap`, `sidePadding`, `projectLayout`, `projectInfo`, `textAlign`.

### Forma e componentes
`cardRadius`, `buttonRadius`, `borderWidth`, `cardStyle`, `shadow`, `buttonStyle`.

### Imagem
`projectAspect`, `imageFit`, `heroStyle`, `heroHeight`.

### Linguagem gráfica
`navStyle`, `graphicStyle`, `animation`, `iconStyle`, `iconStroke`.

### Conteúdo visual
Flags de visibilidade, rótulos das seções, ordem das seções e rodapé.

O backend valida todos os valores antes de gravar para impedir que CSS ou código arbitrário seja injetado no site público.
