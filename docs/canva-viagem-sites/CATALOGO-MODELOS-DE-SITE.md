# Catálogo de modelos de site

> **Status:** arquitetura aprovada para seis modelos
> **Regra:** um único contrato de renderização, uma única fonte de dados e seis composições visuais
> **Última atualização:** 16 de julho de 2026

## Decisão

O Canva Viagem passa a oferecer seis modelos no seletor superior do F4:

1. **Padrão** — portfólio variado;
2. **Horizonte** — consultoria premium;
3. **Ofertas** — emissivo, promoções e condições comerciais;
4. **Experiências** — receptivo, passeios e vivências locais;
5. **Expedições** — aventura, ecoturismo e roteiros intensos;
6. **Excursões** — grupos, datas e saídas programadas.

Os nomes visíveis descrevem o resultado para o usuário. Termos do trade, como “emissivo”, aparecem apenas na explicação, nunca como única pista para escolher.

## O que muda ao trocar o modelo

- composição do hero;
- densidade e geometria dos cards;
- hierarquia de preço, imagem, roteiro e prova social;
- ritmo das seções;
- tipografia e acabamento dos componentes;
- comportamento responsivo específico da composição.

## O que nunca muda ao trocar o modelo

- textos, logo, imagens e contatos cadastrados;
- cores principal, secundária e de fundo da agência;
- pacotes selecionados e seus detalhes;
- edição visual e fundos personalizados por seção;
- pop-up dinâmico de detalhes do pacote;
- deep link de pacote;
- formulário principal;
- envio e identificação de leads no CRM;
- publicação em `public_sites`;
- domínio, Worker e rota do Cloudflare.

O `templateId` é apenas uma configuração persistida no mesmo `siteContent`. Registros antigos sem `templateId` continuam no modelo `standard`.

Hoje existem dois exportadores por idioma, PT e ES. Eles são adaptadores do mesmo contrato: compartilham catálogo, IDs e CSS das variantes, preservam o mesmo fluxo de dados e devem permanecer em paridade. “Um único contrato” não significa fundir os dois arquivos nesta entrega.

## Inspirações de mercado

As referências não devem ser clonadas. Elas validam prioridades de informação já usadas por produtos consolidados:

- **GetYourGuide:** descoberta por categorias, duração, avaliação, preço e confiança para experiências locais. Referência para **Experiências**.
- **TUI:** condições, economia, disponibilidade e comparação rápida de pacotes. Referência para **Ofertas**.
- **Intrepid Travel:** duração, grupos, liderança local e narrativa de aventura. Referência para **Expedições** e **Excursões**.
- **Audley Travel:** fotografia ampla, autoridade do especialista e chamada para planejamento personalizado. Referência para **Horizonte**.

Links oficiais:

- https://www.getyourguide.com/
- https://www.tui.co.uk/holidays/
- https://www.intrepidtravel.com/
- https://www.audleytravel.com/about-us

## Descrição dos modelos

### 1. Padrão

**Para:** agências com produtos e públicos variados.
**Prioridade:** equilíbrio entre apresentação, pacotes, confiança e orçamento.
**Composição:** grade estável, cards tradicionais e fluxo previsível.
**Compatibilidade:** modelo de fallback para registros antigos.

### 2. Horizonte

**Para:** consultorias premium, viagens personalizadas e marcas guiadas por imagem.
**Prioridade:** atmosfera, autoridade e atendimento consultivo.
**Composição:** hero fotográfico amplo, hierarquia editorial e pacotes em mosaico.
**Compatibilidade:** usa os mesmos campos; não depende de preço preenchido.

### 3. Ofertas

**Para:** agências emissivas, promoções, férias e pacotes com condição comercial.
**Prioridade:** preço, parcelamento, inclusões e CTA.
**Composição:** hero direto, cards horizontais densos e leitura de vitrine.
**Estado incompleto:** se não houver preço, o card continua válido e o CTA leva ao orçamento.

### 4. Experiências

**Para:** receptivos, passeios, transfers, guias e atividades locais.
**Prioridade:** fotografia, descoberta, duração, ponto de encontro e experiência.
**Composição:** hero imersivo e mosaico de pacotes com imagem dominante.
**Estado incompleto:** detalhes ausentes são omitidos; nunca são inventados.

### 5. Expedições

**Para:** aventura, natureza, ecoturismo e roteiros com progressão.
**Prioridade:** percurso, logística, requisitos e segurança informada.
**Composição:** linhas firmes, contraste alto e cards alternados em formato de jornada.
**Estado incompleto:** dificuldade, equipamentos e requisitos só aparecem quando cadastrados.

### 6. Excursões

**Para:** grupos, caravanas, rodoviários e saídas programadas.
**Prioridade:** data, organização, confiança, vagas e embarque.
**Composição:** processo em linha do tempo, cards numerados e leitura sequencial.
**Estado incompleto:** “últimas vagas” ou “saída confirmada” nunca são inferidos.

## Regras do seletor no F4

- aparece no topo, antes das configurações avançadas;
- usa um `fieldset` com seis radios nativos;
- mostra miniaturas feitas com a foto e as cores da própria agência;
- seleção é indicada por texto, check e borda, não só por cor;
- desktop amplo: seis em uma linha;
- desktop médio: grade 3 × 2;
- tablet: grade 2 × 3;
- celular: lista vertical, sem carrossel horizontal;
- troca atualiza a prévia imediatamente;
- rascunho é salvo pelo mecanismo existente;
- site público só muda quando o usuário publica ou atualiza o site;
- voltar ao modelo anterior não perde conteúdo.

## Contrato técnico

IDs estáveis:

```ts
type SiteTemplateId =
  | "standard"
  | "horizonte"
  | "ofertas"
  | "experiencias"
  | "expedicoes"
  | "excursoes";
```

Arquivos centrais:

- `src/lib/site-template-catalog.ts` — IDs, nomes, público e normalização;
- `src/components/fabrica/SiteTemplateSelector.tsx` — seletor compartilhado PT/ES;
- `src/lib/site-template-css.ts` — variantes visuais sem lógica de negócio;
- `src/lib/fabrica-html-export.ts` — gerador PT e contrato protegido;
- `src/lib/fabrica-html-export-es.ts` — gerador ES;
- `src/hooks/useFabricaContext.tsx` — persistência do `templateId`.

Não criar uma página React, tabela, formulário ou publicador por modelo.

## Matriz mínima de qualidade

Para cada um dos seis modelos, validar:

- 360 px, 390 px, 768 px e 1440 px;
- zero rolagem horizontal acidental;
- hero, pacotes, equipe, depoimentos, FAQ, CTA e rodapé;
- pacote com e sem imagem;
- um, dois e três ou mais pacotes;
- título curto e título longo;
- paleta clara e paleta escura;
- fundo de seção personalizado pelo usuário;
- popup e deep link do pacote;
- CTA do pacote selecionando o formulário principal;
- em ambiente de teste autorizado, submissão chegando somente ao CRM da agência proprietária;
- recarga da Fábrica preservando o modelo;
- site publicado inalterado até a ação explícita de atualização;
- foco por teclado, contraste e movimento reduzido.

## Critério para novos modelos futuros

Um sétimo modelo só deve ser criado quando houver diferença estrutural comprovada. Nichos como religioso, corporativo, escolar, cruzeiros ou lua de mel podem primeiro usar presets de conteúdo e campos do pacote. Não criar novos templates apenas para trocar cores ou uma fonte.
