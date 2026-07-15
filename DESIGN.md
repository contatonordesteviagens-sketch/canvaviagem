---
name: Canva Viagem Fábrica
description: Sistema operacional visual para agências de viagens.
colors:
  workspace: "#09090B"
  panel: "#18181B"
  panel-raised: "#27272A"
  ui-accent: "#F5F906"
  text-primary: "#FAFAFA"
  text-muted: "#A1A1AA"
  border-subtle: "#3F3F46"
typography:
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.3
rounded:
  control: "12px"
  panel: "16px"
  preview: "24px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.ui-accent}"
    textColor: "{colors.workspace}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
  input:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
---

# Design System: Canva Viagem Fábrica

## Overview

**Creative North Star: "A Bancada da Agência"**

A interface funciona como uma bancada de produção: escura para manter o foco, organizada por etapas e com um único acento luminoso para indicar ação e seleção. A identidade da agência é conteúdo do produto, não decoração da interface. Cores de marca aparecem em prévias e materiais, enquanto o amarelo-limão permanece reservado à navegação da própria Fábrica.

O sistema rejeita configurações duplicadas, controles sem efeito visível e superfícies que escondem a relação entre uma escolha e seu resultado.

**Key Characteristics:**

- Fluxo previsível por fases.
- Prévia em tempo real como confirmação principal.
- Controles compactos com rótulos explícitos.
- Identidade da agência centralizada e reutilizável.

## Colors

A interface usa neutros frios e um acento de produto. As cores da agência são variáveis de conteúdo com papéis nomeados.

### Primary

- **Acento da Fábrica:** reservado a seleção, foco e ações principais do painel.

### Neutral

- **Área de trabalho:** fundo estrutural da aplicação.
- **Painel:** controles, acordeões e barras de ferramentas.
- **Texto principal:** conteúdo de alta prioridade.
- **Texto atenuado:** ajuda, metadados e estados inativos.

### Named Rules

**The Two Palettes Rule.** A cor da interface da Fábrica nunca substitui a paleta da agência. Marca e produto são sistemas separados.

**The Named Role Rule.** Cores da agência são apresentadas como Marca principal, Marca secundária e Fundo, nunca como números sem contexto.

## Typography

**Display Font:** Inter, com fallback de sistema
**Body Font:** Inter, com fallback de sistema

**Character:** direta e funcional. A tipografia desaparece durante o trabalho e preserva legibilidade em painéis densos.

### Hierarchy

- **Title** (700, 18px, 1.25): títulos de painéis e etapas.
- **Body** (400, 14px, 1.6): explicações e conteúdo de configuração, limitado a 70ch quando for prosa.
- **Label** (700, 12px, 1.3): nomes de campos e controles, com caixa alta apenas em metadados curtos.

### Named Rules

**The Read Once Rule.** Rótulos descrevem o resultado da ação sem exigir legenda adicional.

## Elevation

O sistema é plano por padrão e usa camadas tonais e bordas sutis. Sombras aparecem apenas na prévia, em menus flutuantes ou durante foco funcional.

### Shadow Vocabulary

- **Preview:** sombra ampla e difusa para separar o site gerado da bancada da Fábrica.
- **Focused panel:** sombra discreta na cor do acento apenas enquanto um acordeão está aberto.

### Named Rules

**The Flat By Default Rule.** Um painel fechado é separado por contraste e borda, não por sombra decorativa.

## Components

### Buttons

- **Shape:** cantos suavemente arredondados (12px).
- **Primary:** acento da Fábrica com texto escuro e peso forte.
- **Hover / Focus:** mudança tonal em 180ms e foco visível de alto contraste.
- **Secondary:** superfície neutra com borda de 1px.

### Cards / Containers

- **Corner Style:** 16px em painéis e 24px na moldura da prévia.
- **Background:** camadas neutras distintas.
- **Shadow Strategy:** plana por padrão.
- **Border:** 1px com baixo contraste.
- **Internal Padding:** 16px a 24px conforme a densidade.

### Inputs / Fields

- **Style:** fundo neutro, borda de 1px e rótulo acima.
- **Focus:** borda ou anel no acento da Fábrica.
- **Error / Disabled:** texto explícito e estado visual; cor nunca atua sozinha.

### Navigation

A fase ativa usa contraste e acento. Atalhos de teclado aparecem como metadados, não como conteúdo principal.

### Paleta da Marca

Três papéis sincronizados alimentam anúncios e sites: Marca principal, Marca secundária e Fundo. A prévia mostra o efeito imediatamente e oferece restauração segura.

## Do's and Don'ts

### Do:

- **Do** manter uma única fonte de verdade para logo, contatos e cores.
- **Do** mostrar uma prévia imediata sempre que uma cor mudar.
- **Do** preservar contraste automático para textos e botões.
- **Do** manter formulário, CRM e publicação isolados de alterações visuais.

### Don't:

- **Don't** criar editores com configurações duplicadas que produzam resultados diferentes em cada módulo.
- **Don't** fixar conteúdo ou cores visíveis no código quando pertencem à identidade do usuário.
- **Don't** transformar a Fábrica em um portal poluído com decisões simultâneas.
- **Don't** usar páginas de luxo genéricas baseadas apenas em preto, dourado e serifas previsíveis.
- **Don't** adicionar animações que atrapalhem leitura, foco, formulário ou desempenho mobile.
- **Don't** alterar o formulário, o CRM, a publicação ou sites existentes durante mudanças visuais.
