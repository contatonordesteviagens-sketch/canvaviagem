
Objetivo: no mobile, o ícone flutuante do widget Zaia não pode cobrir a barra inferior (especialmente o “Favoritos”) e deve ficar um pouco menor, de forma confiável mesmo quando o widget aplica estilos inline/dinâmicos.

Por que ainda está sobrepondo
- O Zaia injeta elementos via script e pode:
  - criar containers sem “zaia” no id/class (então nossos seletores não pegam),
  - aplicar/alterar inline styles após o load (ganhando da regra CSS),
  - usar estruturas diferentes por dispositivo (ex.: botão fora do iframe).

Solução proposta (robusta): CSS + “fallback” em JavaScript com observação do DOM
1) Dar um “gancho” estável para medir a altura da BottomNav (para calcular a distância correta)
   - Alterar `src/components/canva/BottomNav.tsx` para adicionar um identificador no `<nav>`:
     - Ex.: `id="mobile-bottom-nav"` (ou `data-mobile-bottom-nav="true"`)
   - Benefício: o script consegue medir a altura real da barra e elevar o widget com margem segura (incluindo casos com safe-area iOS).

2) Ajustar o CSS do `index.html` para uma margem maior (primeira linha de defesa)
   - Manter os seletores amplos, porém aumentar o “padrão” para algo mais seguro:
     - `bottom: 120px !important;`
     - `transform: scale(0.75) !important;`
   - Motivo: mesmo que o CSS só pegue “às vezes”, quando pegar já resolve.

3) Adicionar fallback JavaScript no `index.html` (a parte que garante 100%)
   - Inserir um `<script>` logo após o `widget-loader.js` (ou após o CSS), com lógica:
     a) Rodar apenas em telas mobile (ex.: `window.innerWidth <= 768`)
     b) Calcular o offset ideal:
        - Encontrar a BottomNav via `#mobile-bottom-nav`
        - `offset = navHeight + 24` (margem extra)
        - Se não achar nav, usar fallback fixo (ex.: 120px)
     c) Encontrar o “elemento real” do widget:
        - Procurar candidatos diretos: `iframe[src*="zaia"]`, `iframe[src*="zaia.app"]`
        - Procurar candidatos genéricos: elementos com `position: fixed` no canto inferior direito e tamanho pequeno (ex.: width/height < 220px), ignorando `<nav>` e elementos que ocupam a largura toda (para não mexer na BottomNav).
     d) Aplicar estilos via JS com prioridade:
        - `el.style.setProperty('bottom', '<offset>px', 'important')`
        - `el.style.setProperty('right', '16px', 'important')`
        - `el.style.setProperty('transform-origin', 'bottom right', 'important')`
        - `el.style.setProperty('transform', '<transformExistente + scale(0.75)>', 'important')`
          - Se já existir transform, concatenar (ex.: `"matrix(...) scale(0.75)"`) para não quebrar animações do widget.
     e) Reaplicar porque o widget muda depois:
        - `setTimeout` em sequência (ex.: 300ms, 1200ms, 3000ms)
        - `MutationObserver` no `document.body` para detectar novos nós/alterações de atributo (`style`, `class`) e reaplicar quando o widget for recriado/atualizado.
        - `resize` / `orientationchange` com debounce para recalcular offset.

4) Critérios de segurança (para não afetar outros elementos)
   - Só aplicar em elementos que:
     - estejam no canto inferior direito (por boundingClientRect),
     - sejam “pequenos” (não full-width),
     - tenham `position: fixed` e z-index alto (quando disponível),
     - não sejam a BottomNav (excluir `#mobile-bottom-nav` e `nav`).

5) Testes de validação (no preview)
   - Abrir em largura ~375px
   - Confirmar:
     - botão Favoritos clicável,
     - ícone do Zaia acima da barra com folga,
     - ícone visivelmente menor,
     - não “pula” de posição ao carregar (observer resolve).
   - Se ainda encostar, aumentar margem (ex.: `+32px`) sem mexer no layout geral.

Arquivos que serão alterados
- `index.html`
  - Ajustar valores do CSS (bottom/scale)
  - Adicionar script JS com MutationObserver + cálculo pela BottomNav
- `src/components/canva/BottomNav.tsx`
  - Adicionar `id`/`data-attribute` no `<nav>` para o script medir a altura e evitar heurísticas frágeis

Observação importante
- Se o Zaia renderizar o botão dentro de um iframe cross-domain, não dá para alterar “dentro” do iframe, mas mover/escala do iframe/container funciona. O fallback proposto atua exatamente nesse nível (container/iframe), por isso é o caminho mais confiável.
