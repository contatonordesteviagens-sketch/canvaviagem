# Plano de implementação — carrossel de pacotes no F1

> **Status:** beta funcional implementado localmente em 18/07/2026
> **Prioridade atual:** validar com usuários antes de adicionar publicação automática ou persistência remota
> **Objetivo:** transformar pacotes e artes do F1 em carrosséis editáveis sem duplicar cadastro, inventar informações ou multiplicar arquivos.

## O que já está implementado

- entrada própria `Anúncio | Carrossel` no topo do F1;
- atalho `Transformar em carrossel` depois da geração de uma arte;
- fonte única nos pacotes já sincronizados com Painel, Plano e Site;
- sequência dinâmica de 3 a 7 slides, omitindo campos vazios;
- modelos visuais **Impacto**, **Roteiro** e **Editorial**;
- formatos **Feed 4:5 (1080 × 1350)** e **Story 9:16 (1080 × 1920)**;
- edição de selo, título, texto, itens, preço, CTA, imagem e enquadramento;
- adicionar, duplicar, remover e reordenar até 10 slides;
- cores conectadas à paleta principal, secundária e de fundo da Fábrica;
- atualização manual a partir do pacote, sem inventar dados;
- autosave local por projeto e pacote, sem guardar imagens base64;
- exportação sequencial dos slides em PNG na resolução final;
- telas em português e espanhol;
- estado vazio explicando que o usuário deve cadastrar o pacote uma única vez.

### Limites conscientes desta beta

- o rascunho do carrossel fica no navegador atual; persistência entre dispositivos exige a tabela `fabrica_carousels` com RLS descrita abaixo;
- imagens externas sem CORS podem impedir a renderização do PNG; banco oficial, Storage e uploads processados continuam sendo as fontes recomendadas;
- publicação automática no Instagram/Meta não faz parte desta etapa;
- o carrossel não altera o formulário nem o CRM.

## Resultado esperado

Duas entradas convergem para o mesmo editor:

```text
Arte gerada no F1                     F1 → Carrossel
        ↓                                   ↓
Transformar em carrossel              Selecionar pacote
        └───────────────┬───────────────────┘
                        ↓
              Editor único de carrossel
                        ↓
             Revisar, editar e exportar
```

### Entrada A — depois de gerar uma arte

Adicionar ao bloco do resultado, ao lado do download:

> **Transformar em carrossel**

O botão usa a variação selecionada como capa e tenta localizar o pacote já sincronizado. Se não houver correspondência segura, pede a seleção do pacote. Nunca escolhe silenciosamente por semelhança parcial de nome.

### Entrada B — opção própria

No topo do F1:

```text
[ Anúncio ] [ Carrossel ]
```

A opção não cria uma nova fase da Fábrica. As duas entradas chamam o mesmo componente e a mesma função de criação de rascunho.

## Fonte única de dados

`Pacote` continua sendo a fonte de verdade. O carrossel referencia o pacote e guarda apenas a organização dos slides, textos derivados, edições específicas, configurações visuais e URLs de assets.

Campos reutilizados quando existirem:

- título, subtítulo e descrições;
- preço, detalhes e condições de pagamento;
- datas, duração, saída e ponto de encontro;
- hospedagem e disponibilidade;
- destaques, inclusões e exclusões;
- roteiro;
- requisitos e documentos;
- acessibilidade, cancelamento e observações;
- imagem principal, galeria e FAQs;
- logo, cores e contatos da agência.

Não criar um segundo formulário de pacote. Contatos pertencem à agência, não a cada carrossel.

## Regra crítica — não fabricar fatos

O gerador pode resumir, reorganizar e adaptar o tom de dados existentes. Não pode inventar preço, parcela, desconto, data, vaga, inclusão, hotel, voo, seguro, documento, dificuldade, política ou garantia de saída.

Quando um dado faltar:

1. omitir o bloco;
2. reorganizar a estrutura;
3. recomendar “Complete este dado no pacote”;
4. abrir o editor do pacote e salvar o fato na entidade `Pacote` antes de reutilizá-lo.

Preço, data, disponibilidade, inclusão, exclusão, logística e demais fatos estruturados não podem existir somente no carrossel. Texto promocional livre pode ser editado no slide e fica marcado como alteração manual, mas não substitui os campos comerciais do pacote.

O objetivo `ultimas-vagas` só fica habilitado quando a disponibilidade cadastrada no pacote sustenta explicitamente essa afirmação.

## Estrutura inicial de seis slides

| Slide | Função | Origem |
|---|---|---|
| 1. Capa | atenção | arte selecionada, imagem, título e subtítulo |
| 2. Desejo e valor | contexto | descrição longa e principal diferencial |
| 3. Destaques | descoberta | destaques e galeria |
| 4. O que inclui | concretude | inclusões e exclusões cadastradas |
| 5. Como será | entendimento | roteiro, duração, datas, saída e hospedagem |
| 6. Oferta e CTA | conversão | preço, pagamento, disponibilidade e contato |

No MVP, o usuário pode trabalhar com 3 a 7 slides, adicionar um slide vazio, remover, duplicar, reordenar, trocar tipo, imagem, texto, cor, layout e CTA. Limites maiores devem ser avaliados depois com testes reais de edição e exportação em celular.

Se não houver conteúdo suficiente para três slides, o editor mostra quais campos completar, em vez de preencher com informação fictícia.

## Adaptação por segmento

### Receptivo e passeios

Priorizar atrações, inclusões, duração, horário, ponto de encontro, requisitos e reserva.

### Emissivo

Priorizar destino, transporte, hospedagem, datas, saída, inclusões, preço e pagamento.

### Sob medida

Priorizar possibilidades, personalização, roteiro inspiracional e consultoria. Não mostrar preço fixo quando estiver sob consulta.

### Grupos e excursões

Priorizar data, roteiro, embarque, logística, disponibilidade, sinal e reserva de vaga, apenas quando cadastrados.

### Cruzeiros

Priorizar rota, portos, cabine, datas, documentos, inclusões e exclusões. Não presumir taxas ou bebidas incluídas.

### Aventura e ecoturismo

Priorizar percurso, duração, logística, requisitos e segurança. Nunca inferir dificuldade.

### Religioso e corporativo

Adaptar tom e ordem dos fatos existentes. Não criar atividade obrigatória, preço fechado ou promessa operacional.

## Fluxo mobile-first

1. **Origem:** pacote, capa e resumo dos dados encontrados.
2. **Estrutura:** objetivo, formato, 3/5/7 slides sugeridos e ordem.
3. **Edição:** uma miniatura por slide, editor abaixo no celular, imagem, enquadramento, textos, cores e layout.
4. **Revisão:** alertas de corte ou ausência, visualização conjunta e exportação.

Regras:

- alvos de toque de pelo menos 44 px;
- ações principais fixas no celular;
- autosave, desfazer e refazer;
- não depender de hover;
- não empilhar modais;
- preservar edição manual ao regenerar;
- renderizar em alta resolução apenas na exportação.

## Modelo de dados sugerido

```ts
type CarouselFormat = "portrait-4x5" | "story-9x16";
type CarouselObjective = "oferta" | "inspiracao" | "informativo" | "ultimas-vagas";
type CarouselSlideKind =
  | "cover"
  | "value"
  | "highlights"
  | "included"
  | "itinerary"
  | "logistics"
  | "price-cta"
  | "custom";

interface FabricaAssetRef {
  url: string;
  hash?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  source: "platform" | "storage" | "generated" | "external";
  bucket?: "thumbnails";
  path?: string;
}

interface CarouselContentBlock {
  id: string;
  role: "eyebrow" | "headline" | "body" | "bullet-list" | "price" | "cta";
  text?: string;
  items?: string[];
  sourceFields?: string[];
  manuallyEdited: boolean;
}

interface CarouselSlide {
  id: string;
  order: number;
  kind: CarouselSlideKind;
  layoutId: string;
  blocks: CarouselContentBlock[];
  image?: FabricaAssetRef;
  imageFocalPoint?: { x: number; y: number };
  colorOverrides?: Record<string, string>;
}

interface CarouselProject {
  id: string;
  userId: string;
  fabricaProjectId?: string;
  sourcePackageId: string;
  sourcePackageVersion: string;
  sourceAdAsset?: FabricaAssetRef;
  title: string;
  objective: CarouselObjective;
  format: CarouselFormat;
  templateId: string;
  brandMode: "sync-with-fabrica" | "custom";
  slides: CarouselSlide[];
  status: "draft" | "ready";
  schemaVersion: 1;
  createdAt: string;
  updatedAt: string;
}
```

Não salvar base64 dentro do projeto.

### Versão do pacote

Como `Pacote` ainda não possui `updated_at` próprio, `sourcePackageVersion` deve ser um SHA-256 determinístico dos campos normalizados do pacote no momento da criação/atualização do carrossel. O hash exclui ordem de chaves e campos transitórios. Uma diferença de hash ativa o aviso de atualização. Se no futuro cada pacote ganhar versão ou timestamp persistido, a migração deve manter compatibilidade com esse campo.

## Sincronização posterior

Cada bloco deve saber de quais campos do pacote nasceu. Quando o pacote mudar:

- mostrar “Este pacote foi atualizado”;
- oferecer “Atualizar conteúdo do carrossel”;
- atualizar somente blocos ainda não editados manualmente;
- nunca sobrescrever texto personalizado;
- nunca apagar slide ou imagem sem confirmação.

## Persistência

Para produção, criar `fabrica_carousels` com RLS por `user_id`, em vez de aumentar indefinidamente `fabrica_diagnosticos.state_snapshot`.

Campos mínimos: `id`, `user_id`, `fabrica_project_id`, `source_package_id`, `source_package_version`, `title`, `objective`, `format`, `template_id`, `brand_mode`, `source_ad_asset`, `slides`, `status`, `schema_version`, `created_at`, `updated_at`.

Não liberar produção sem aplicar e validar a migration e as políticas de RLS. Um protótipo local deve ficar atrás de feature flag.

## Assets e economia de armazenamento

- imagem do banco oficial: guardar só URL/ID canônico;
- URL externa HTTPS estável: reutilizar;
- upload, base64 ou arte gerada: processar uma vez;
- backend canônico do MVP: bucket Supabase Storage `thumbnails`;
- caminho canônico: `sites/<user-id>/assets/<sha256>.webp`, já usado pelo F4;
- guardar `bucket` e `path` para assets próprios; a URL pública é derivada, não a identidade do arquivo;
- validar HTTPS, MIME type, tamanho e origem antes de importar uma URL externa;
- converter preview para WebP;
- calcular SHA-256 e deduplicar;
- reutilizar o mesmo asset nos slides;
- guardar especificação leve, não bitmaps renderizados;
- gerar PNG somente no download;
- exportar slides sequencialmente no celular;
- liberar canvas, blobs e object URLs.

Excluir um carrossel não apaga imediatamente um arquivo deduplicado, pois ele pode ser usado por site, anúncio ou outro carrossel. Uma limpeza periódica só pode remover um asset sem referências em todas as entidades, pertencente ao usuário correto e mais antigo que o período de retenção definido. As políticas do bucket devem impedir escrita fora de `sites/<auth.uid()>/assets/`.

Extrair o processamento hoje existente no F4 para um utilitário compartilhado, por exemplo `src/lib/fabrica-assets.ts`.

## Motor de renderização

Formatos iniciais:

- feed vertical 4:5: `1080 × 1350`, padrão;
- story vertical 9:16: `1080 × 1920`.

Durante a edição, renderizar apenas o slide ativo e miniaturas leves. O motor deve detectar texto cortado, contraste insuficiente, imagem não carregada, fonte ausente e logo desproporcional.

A beta começa com três famílias visuais, sem multiplicar combinações antes dos testes:

- **Impacto:** preço, condição, benefícios e CTA em alta hierarquia;
- **Roteiro:** sequência informativa, logística e etapas da experiência;
- **Editorial:** imagem, desejo, narrativa e diferenciais com tom mais premium.

Criar `fabrica-carousel-render.ts` como motor isolado. Não ampliar o arquivo monolítico `fabrica-compose-art.ts`; ele continua responsável pelos anúncios atuais até uma refatoração própria e testada.

## Auditoria do F1 antes da implementação

O F1 atual precisa destas proteções antes de receber o carrossel:

- a arte final ainda pode existir como PNG/data URL no estado do React;
- o resultado gerado não possui vínculo obrigatório e estável com `projectId` e `packageId`;
- a imagem gerada pode sobreviver visualmente a uma troca de projeto se o estado transitório não for limpo;
- os formatos atuais são principalmente 1:1 e 9:16; o carrossel precisa de composição nativa 4:5, não de corte da arte de Stories;
- textos automáticos existentes não podem ser reaproveitados quando inventarem “vagas limitadas”, “suporte 24h”, “pacote completo” ou qualquer promessa ausente no pacote;
- o planejamento de slides deve ser determinístico a partir de `Pacote`; IA pode ajudar na redação, mas não é a fonte dos fatos.

O carrossel deve sempre persistir `fabricaProjectId` e `sourcePackageId`. Associação aproximada por título só pode sugerir uma escolha ao usuário; nunca salva silenciosamente.

## Arquivos a inspecionar

- `src/pages/Fabrica.tsx` e `FabricaES.tsx`;
- `src/pages/fabrica/Phase3ArtFactory.tsx` e versão ES;
- `src/hooks/useFabricaContext.tsx`;
- `src/lib/package-details.ts`;
- `src/pages/fabrica/FabricaLibrary.tsx` e versão ES;
- `src/pages/fabrica/Phase4LandingBuilder.tsx` como referência de assets.

Novos arquivos sugeridos:

- `src/pages/fabrica/CarouselBuilder.tsx`;
- `src/lib/fabrica-carousel-types.ts`;
- `src/lib/fabrica-carousel-plan.ts`;
- `src/lib/fabrica-carousel-render.ts`;
- `src/lib/fabrica-assets.ts`;
- `src/hooks/useFabricaCarousels.ts`;
- migration para `fabrica_carousels`.

Não alterar formulário, CRM, Worker, publicação ou domínio dos sites.

## Fases

1. **Proteção:** testes de regressão do F1, feature flag e limites.
2. **Dados/assets:** tipos, migration/RLS, hook, dedupe e função pura de rascunho.
3. **Editor MVP:** duas entradas, 3 a 7 slides sugeridos, três famílias visuais, edição, reordenação e autosave.
4. **Render/export:** 4:5, 9:16, alertas e exportação sequencial.
5. **Biblioteca:** listar, reabrir, duplicar, atualizar origem e excluir.
6. **Rollout:** feature flag primeiro na experiência PT-BR, celular real, métricas e só então paridade ES.

## Critérios de aceite essenciais

- as duas entradas abrem o mesmo editor;
- a arte escolhida vira a capa correta;
- o pacote é relacionado com segurança;
- nenhum formulário de pacote é duplicado;
- nenhum fato comercial é inventado;
- pacotes antigos e incompletos continuam funcionando;
- tudo é editável e persiste após recarregar;
- cores sincronizam com a Fábrica, com override local opcional;
- URLs são reutilizadas, uploads deduplicados e base64 não vai ao banco;
- PNG só é criado na exportação;
- RLS impede acesso cruzado;
- anúncio atual, site, formulário e CRM passam em regressão.

## Fora do MVP

- postagem automática ou API da Meta;
- agendamento;
- vídeo ou música;
- colaboração simultânea;
- imagem inédita para cada slide;
- armazenamento automático de PNG final;
- página pública separada para carrossel.

## Pesquisa de formato validada em 18/07/2026

Referências oficiais consultadas:

- [Meta — formato de anúncio em carrossel](https://www.facebook.com/business/ads/carousel-ad-format): permite desenvolver uma história, explicar um processo ou detalhar um único produto ao longo de até dez cards. Em narrativa sequencial, a ordem não deve ser otimizada automaticamente.
- [Instagram/Meta — publicação com múltiplas mídias](https://www.facebook.com/help/269314186824048/): uma publicação aceita até dez fotos ou vídeos e toda a sequência compartilha a mesma orientação.
- [Meta — boas práticas para anúncios com foto](https://www.facebook.com/business/ads/photo-ad-format): menos texto, um ponto focal por arte e consistência visual entre as peças.
- [Meta — anúncios no Instagram](https://www.facebook.com/business/ads/instagram-ad): o carrossel é um formato nativo de profundidade e descoberta por gesto de deslizar.

Decisões aplicadas ao Canva Viagem:

- manter o MVP em seis slides, com limite técnico de dez;
- uma única orientação por carrossel;
- cada slide deve ter uma função e um foco visual;
- a sequência deve permanecer ordenada quando formar uma narrativa;
- capas, slides informativos e CTA compartilham logo, paleta e sistema tipográfico;
- os dois modelos iniciais serão originais do Canva Viagem, inspirados em padrões de mercado e não em cópias de peças de CVC, Decolar ou outra marca;
- o formato 4:5 continua como padrão orgânico mobile-first; 1:1 permanece disponível para compatibilidade e anúncios que exigirem essa proporção.
