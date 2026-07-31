# Bíblia Técnica do Motor Canvas (Fábrica de Artes)
> **ATENÇÃO, INTELIGÊNCIA ARTIFICIAL:** Leia este documento INTEIRO antes de tentar consertar bugs de texto sumindo, botões que não funcionam ou problemas de renderização no Editor de Artes (`ArtTweakEditor.tsx`).

## 1. Como a Engrenagem Funciona (A Arquitetura)
O Canva Viagem não usa um editor de canvas tradicional (como Fabric.js). Ele usa um sistema de **Intercepção via Proxy**.
Existem 3 arquivos principais que formam o coração do sistema:

1. **`src/lib/fabrica-compose-art.ts` (O Desenhista Cego):** 
   - Contém a função `composeTravelAd`. Ela acha que está desenhando em um Canvas normal. Ela recebe o `ctx` (CanvasRenderingContext2D) e chama `ctx.fillText`, `ctx.fillRect`, etc.
   - **Regra de Ouro:** A ordem de desenho aqui é de baixo para cima (Background -> Shapes -> Textos -> Contatos). Se algo travar no meio (ex: um erro de sintaxe), os elementos finais (textos, ícone do instagram) simplesmente não aparecem.

2. **`src/lib/fabrica-art-recorder.ts` (O Gravador Espião - Proxy):**
   - Este arquivo exporta `createArtRecorder`. Ele pega o `ctx` original e embrulha em um `Proxy`.
   - Quando `composeTravelAd` chama `ctx.fillText()`, o Proxy intercepta a chamada, anota as coordenadas e o texto, e salva em uma lista (`elements`).
   - É aqui que as modificações (`tweaks`) são aplicadas! Antes de repassar a ordem para o Canvas real, o Proxy olha se aquele elemento tem algum "tweak" (ex: `hidden: true`, `bold: true`, `dx: 50`) e modifica a instrução nativa. Se `hidden` for true, ele dá um `return` e não desenha nada.

3. **`src/components/fabrica/ArtTweakEditor.tsx` (O Controle Remoto - UI):**
   - É a interface visual (O "Canva").
   - Quando o usuário clica e arrasta um texto, este componente apenas atualiza um estado React (`tweaks`).
   - Esse estado é enviado de volta para `composeTravelAd`, que roda **toda a arte de novo**, mas agora o Gravador Espião (`fabrica-art-recorder.ts`) injeta as novas coordenadas e estilos na hora de desenhar.

## 2. Por que os botões (como Remover) param de funcionar?
Se um botão no `ArtTweakEditor.tsx` atualiza o estado (ex: `patchSelected({ hidden: true })`), mas a arte não muda, **o problema quase sempre está no `fabrica-art-recorder.ts`**.
- O Proxy precisa saber ler a propriedade `hidden` e impedir o desenho. 
- O mesmo vale para Negrito/Itálico (`t.bold` e `t.italic`): O Proxy precisa interceptar o `Object.defineProperty(proxy, "font")`, injetar a string `bold` e aplicar no Canvas real.

## 3. Zonas de Perigo (Não toque sem entender)
* **`Object.defineProperty` no Proxy:** Métodos nativos do Canvas (como getters e setters de `.font` ou `.fillStyle`) odeiam Proxies e lançam `TypeError: Illegal invocation`. É preciso lidar com `bind(proxy)` e `origSet.call()` cuidadosamente.
* **safeFillText:** O cálculo de quebra de texto reduz a fonte automaticamente (loop `while (ctx.measureText().width > max)`). Se o proxy não retornar a largura correta, o loop trava.
* **TOTAL_VARIANTS:** Em `fabrica-compose-art.ts`, cada arte é definida por um índice (`variant === 0, 1, 2...`). Nunca quebre a ordem nem remova um índice sem atualizar o total no front-end.

## Comando de Invocação para a IA
Quando quiser que um Agente trabalhe nesta área, use o seguinte prompt:
> *"Vá até a Fábrica de Artes. O editor de UI está em `ArtTweakEditor.tsx`, o proxy de desenho está em `fabrica-art-recorder.ts` e as variantes estão em `fabrica-compose-art.ts`. Antes de alterar qualquer coisa, leia o arquivo `DOC_ENGENHARIA_MOTOR_CANVAS.md` para entender como o Proxy funciona e não quebrar o texto."*
