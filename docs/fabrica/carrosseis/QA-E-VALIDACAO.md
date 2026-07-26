# QA e validação
## Validações executadas

No commit funcional `55689a7c`:

- `npx eslint src/components/fabrica/F1CarouselBuilder.tsx`;
- `npx tsc --noEmit`;
- `npm run build`;
- renderização visual das oito variantes;
- auditoria DOM dos limites de título, descrição e bullets;
- confirmação de três cores independentes no mesmo slide;
- verificação de ausência de overflow horizontal;
- revisão independente de código.

Após a revisão foram adicionadas proteções para:

- troca entre fundos claros e escuros;
- FAQ com cor principal clara;
- migração de rascunhos antigos;
- conteúdo denso em Roteiro, Oferta e FAQ;
- objetivo ativo no mobile.

## Checklist antes de publicar

- [ ] O destino selecionado é o mesmo do pacote.
- [ ] A capa original continua intacta.
- [ ] Alterar a cor do título não muda descrição ou bullets.
- [ ] Alterar a descrição aparece imediatamente na prévia.
- [ ] Inspirar não fica colado à base.
- [ ] Roteiro cresce para cima sem cortar o texto.
- [ ] Oferta alterna direita/esquerda.
- [ ] Guia, Confiança e FAQ mantêm suas composições.
- [ ] Curvo e Transparente exportam corretamente.
- [ ] 3, 4, 5 e 6 imagens ajustam a faixa de miniaturas.
- [ ] O objetivo ativo aparece no celular.
- [ ] Download gera todos os slides em 4:5.
- [ ] Reabrir a página recupera o rascunho do projeto e pacote corretos.
- [ ] Trocar de projeto não mistura o rascunho.

## Comandos

```powershell
npx.cmd eslint src/components/fabrica/F1CarouselBuilder.tsx
npx.cmd tsc --noEmit
npm.cmd run build
```
