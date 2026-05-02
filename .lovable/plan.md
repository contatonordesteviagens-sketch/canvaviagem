## O que entendi do seu pedido

Você quer que a seção "3 · Dados do anúncio" fique **mais limpa, mais leiga-friendly** e que as opções extras (que hoje só valem para a variação V3 — Total, Faixa Pix) passem a valer para **todas as variações (V0, V1, V2, V3)** e todos os **modos** (Foto Real, Sua Imagem, IA Pura). Além disso, ajustes de UX em destino, complemento, promoção e correção de bugs no campo "Sem centavos". Mantendo o que já está, sem modificar o que já fizemos e que está bem estruturado. 

---

## Mudanças propostas

### 1. Painel "Opções de variações de preço" (colapsado, unificado)

- Renomear o bloco "Opções da variação V3" → **"Opções de variações de preço"**.
- Tirar o visual amarelo / o aviso "(box amarelo · só afeta a V3)".
- Transformar em um **accordion fechado por padrão** (texto: "+ Mais opções de preço"). O agente clica para abrir.
- Todas as opções **desativadas por padrão**.
- Renomear:
  - "Mostrar linha 'Total'" → **"Mostrar mais uma linha com o valor total"** + exemplo abaixo: *"Ex.: Total por casal: R$ 3.998"*.
  - "Mostrar faixa azul do Pix" → **"Mostrar faixa de destaque (ex.: 5% OFF no Pix)"**.
- Os campos de texto (total custom, texto da faixa) ficam ao lado do toggle correspondente.

### 2. Aplicar essas opções a TODAS as variações (V0, V1, V2, V3)

- Hoje só V3 (yellow_box_cvc) renderiza linha "Total" e faixa Pix. Vou adicionar a renderização condicional dessas duas peças nos demais layouts compostos localmente (`classic_vertical`, `cancun_style`, `gramado_style`, `maceio_style`, `ticket_pix_card`, `side_hero_performance`, `iconic_landmark`, `split_yellow_side`, `elegant_center`, `editorial_visual`, `top_editorial_photo`, `two_scene_editorial`) em `src/lib/fabrica-compose-art.ts`.
- Posicionamento: linha "Total" logo abaixo do bloco de preço; faixa de destaque como rodapé fino. Estilo respeita as cores primária/secundária da arte.
- Vale para os 3 modos (Foto Real, Sua Imagem, IA Pura) — basta passar os mesmos parâmetros que já são enviados ao compositor.

### 3. Formatação numérica do campo "Total"

- O campo `totalOverride` hoje é texto livre. Vou aplicar a mesma máscara dos outros valores: separador de milhar e casas decimais por moeda.
- O toggle **"Sem centavos"** passa a afetar também o campo Total (remove os centavos automaticamente).

### 4. Bug do "Sem centavos" — restaurar decimais ao desmarcar

**Causa:** hoje guardamos só a string formatada de `price`. Quando "Sem centavos" é marcado, os `,00` somem do texto e a informação se perde — desmarcar não tem como restaurar.
**Correção:** guardar separadamente o **valor numérico cru** (`priceRaw` em centavos) no estado/contexto. O campo visível é sempre derivado de `priceRaw + hideCents + currency`. Marcar/desmarcar "Sem centavos" passa a ser puramente uma reformatação — totalmente reversível. Mesmo padrão para o campo Total.

### 5. Dropdown de "Complemento" igual ao de "Título do anúncio"

- Hoje usa `<datalist>` nativo (por isso só aparece quando o texto é apagado).
- Trocar por um **dropdown customizado idêntico ao de "Título do anúncio"** com seta `ChevronDown`, abre ao clicar mesmo com texto preenchido.
- Presets: `por pessoa`, `por casal`, `por pacote`, `por grupo`, `por adulto`, `por criança`, `total do pacote`, `taxas inclusas`, `+ taxas`.

### 6. Destino — remover chips de cima, usar dropdown

- Remover a linha de chips (Buenos Aires / Paris / Ceará).
- Manter só o input com **dropdown** (ChevronDown) que lista:
  - Destinos cadastrados pela agência (`state.destinos`)
  - - presets populares (Maragogi, Cancún, Gramado, Buenos Aires, Paris, Lisboa, Orlando, Bariloche, Fernando de Noronha, Punta Cana, Santiago, Madrid…)

### 7. Nome da promoção — também com dropdown de sugestões

- Mesmo padrão visual. Presets: `BLACK FRIDAY`, `LIQUIDA VERÃO`, `OFERTA RELÂMPAGO`, `MEGA PROMO`, `SEMANA DO CONSUMIDOR`, `FÉRIAS IMPERDÍVEIS`, `LANÇAMENTO`, `ÚLTIMAS VAGAS`, `OFERTA EXCLUSIVA`.
- Continua editável (o usuário pode digitar livre).

### 8. Padronização visual

- Todos os dropdowns (Título, Destino, Promoção, Complemento) seguem o **mesmo componente** (mesmo estilo, mesma cor de borda/destaque, mesma altura).
- Vou extrair em um pequeno componente interno `<PresetSelect>` para evitar duplicação.

---

## Arquivos que serão alterados

- `src/pages/fabrica/Phase3ArtFactory.tsx` — UI dos campos, accordion, dropdowns, lógica do `priceRaw`.
- `src/hooks/useFabricaContext.tsx` — adicionar `priceRaw`, `totalRaw`; manter compatibilidade com `lastPrice` antigo.
- `src/lib/fabrica-compose-art.ts` — propagar `showTotal`/`totalOverride`/`showPixBanner`/`pixBannerText` para todas as variações compostas localmente; aplicar `hideCents` no `totalOverride`.

V0, V1, V2 e V3 continuam funcionando — só ganham as opções extras quando o agente decidir ativar.

---

**Confirma que é isso?** Se sim, eu aplico tudo de uma vez.