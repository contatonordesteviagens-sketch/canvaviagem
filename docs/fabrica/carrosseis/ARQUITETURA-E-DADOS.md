# Arquitetura e dados
## Arquivo principal

`src/components/fabrica/F1CarouselBuilder.tsx`

Responsabilidades atuais:

- selecionar pacote e quantidade;
- criar a sequência de slides;
- aplicar um objetivo visual;
- editar texto, tipografia, cor e fotografia;
- gerar legenda;
- manter rascunho local;
- exportar todas as imagens.

## Fonte de verdade

O conteúdo comercial parte do `Pacote` recebido pelo contexto da Fábrica.
Destino, descrição, inclusões, logística, preço e demais fatos não devem ser
inventados pelo carrossel.

## Separação por projeto e pacote

O rascunho local usa a chave:

```text
fabrica-carousel-v2:<locale>:<projectId>:<packageId>
```

Isso evita que dois pacotes do mesmo projeto utilizem o mesmo rascunho e também
separa projetos diferentes.

## Persistência atual

O estado textual e visual é salvo em `localStorage`. Imagens em base64 não são
persistidas nesse rascunho para evitar exceder o limite do navegador. Fotos
enviadas por usuário autenticado são otimizadas e armazenadas no Supabase
Storage; sem autenticação, a foto aplicada é temporária.

### Limite conhecido

O rascunho ainda não é sincronizado entre dispositivos ou navegadores. Para uma
persistência definitiva em nuvem, implementar `fabrica_carousels` com RLS e
vínculos obrigatórios:

- `owner_id`;
- `project_id`;
- `package_id`;
- `locale`;
- versão ou hash do pacote;
- conteúdo dos slides;
- configuração visual;
- URLs dos assets;
- `created_at` e `updated_at`.

Nunca recuperar ou salvar um carrossel apenas por nome de destino.

## Compatibilidade

Rascunhos antigos recebem:

- `slideVariant = "impact"` quando ausente;
- `bulletIcon = "none"` quando ausente;
- migração de uma cor global customizada para título, descrição e bullets.

## Exportação

O canvas utiliza a mesma árvore React na prévia e na exportação. A exportação
valida capa, logo, telefone e CTA antes de gerar os arquivos com `html2canvas`.
Os layouts novos evitam `backdrop-filter` para manter compatibilidade.
