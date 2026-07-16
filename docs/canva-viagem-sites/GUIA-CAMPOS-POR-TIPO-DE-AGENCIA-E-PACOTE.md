# Guia de campos por tipo de agência e pacote

## 1. Como usar este guia

Os campos são recomendações contextuais, não novas obrigações. O editor deve:

1. pedir primeiro o tipo do produto;
2. considerar o perfil da agência;
3. mostrar os campos básicos;
4. manter **Adicionar mais informações** recolhido;
5. ao expandir, priorizar campos relevantes para aquela combinação;
6. permitir salvar mesmo sem preencher os detalhes.

Os exemplos abaixo devem aparecer como `placeholder` ou texto de ajuda sem serem gravados como conteúdo real.

## 2. Modelo canônico

O cadastro deve ser uma entidade **Produto**, não um bloco de texto preso ao site:

```text
Produto
├── resumo público
├── opcoes[] (datas, saídas, ocupações ou variantes vendáveis)
├── detalhes comuns
└── campos condicionais do segmento
```

`opcoes[]` evita duplicar um pacote inteiro quando mudam apenas data, saída, ocupação, cabine ou preço. Cada opção pode ter disponibilidade, unidade de preço, ocupação, taxas e condição de pagamento próprias.

Os detalhes comuns incluem datas, duração, origem, logística, destaques, inclusões, exclusões, roteiro, documentos, acessibilidade, políticas e FAQ. Os campos condicionais aparecem conforme o segmento, sem apagar dados quando o tipo muda.

## 3. Campos básicos para qualquer pacote

| Campo | Obrigação | Exemplo de ajuda |
|---|---:|---|
| Título | básico | `Porto de Galinhas — 5 dias` |
| Descrição curta | básico | `Praias, piscinas naturais e hospedagem com café da manhã.` |
| Imagem principal | básico | `Escolha uma imagem do banco ou envie do dispositivo.` |
| Preço | opcional | `A partir de R$ 2.490 por pessoa` |
| Botão | padrão editável | `Ver detalhes` |
| Tipo do produto | recomendado | `Pacote, passeio, transfer, hospedagem, cruzeiro...` |
| Destino/localidade | recomendado | `Porto de Galinhas, Pernambuco` |
| Unidade/ocupação | recomendado com preço | `por pessoa em apartamento duplo` |
| Taxas | recomendado com preço | `taxas inclusas` ou `+ taxas portuárias` |

Quando o preço depender de cotação, permitir `Sob consulta`. Não transformar zero, campo vazio ou texto incompleto em um preço público. Sempre contextualizar um preço exibido com unidade, ocupação e situação das taxas; `R$ 2.490` sozinho é ambíguo.

## 4. Perfis de agência

### Emissiva

Envia viajantes para destinos nacionais ou internacionais. Priorizar:

- cidade/país de destino;
- origem ou aeroporto de saída;
- datas e duração;
- transporte e bagagem;
- hospedagem e regime de alimentação;
- documentação, seguro e moeda em viagens internacionais;
- condições de pagamento e política de alteração.

### Receptiva / DMC

Atende o viajante no destino. Priorizar:

- ponto de encontro e área de busca;
- horário e duração da atividade;
- idioma do guia;
- modalidade privativa ou compartilhada;
- idade mínima, acessibilidade e esforço físico;
- clima, itens para levar e política de cancelamento;
- cobertura territorial e retorno.

### Mista

Mostrar a recomendação do tipo de produto selecionado, sem obrigar a agência a escolher um único perfil para todo o catálogo.

### Excursões e grupos

Priorizar:

- pontos e horários de embarque;
- número mínimo/máximo de viajantes;
- coordenador/acompanhante;
- regras de assento e bagagem;
- parcelas, prazo de confirmação e cancelamento;
- programação por dia.

### Corporativo / MICE

Priorizar:

- finalidade da viagem ou evento;
- cidade, local e período;
- número estimado de participantes;
- hospedagem, transporte e salas;
- alimentação, equipamentos e credenciamento;
- SLA/contato comercial;
- orçamento sob consulta e escopo personalizável.

### Sob medida / luxo

Priorizar:

- perfil de viajante;
- nível de personalização;
- categorias de hospedagem e transporte;
- experiências privativas;
- concierge e suporte;
- faixa de investimento, sem promessa de preço fixo;
- prazo recomendado para planejamento.

## 5. Taxonomia de produtos

### 5.1 Pacote com hospedagem

Campos prioritários:

- duração/noites;
- período ou datas disponíveis;
- cidade de saída;
- meio de transporte;
- hotel e categoria;
- tipo de quarto;
- regime de alimentação;
- traslados;
- bagagem;
- inclui/não inclui;
- parcelamento.

Placeholders:

- Datas: `10 a 15 de setembro de 2026` ou `Saídas às quintas, sujeito a disponibilidade`.
- Duração: `5 dias e 4 noites`.
- Inclui: `Passagem aérea ida e volta`.
- Não inclui: `Taxas locais pagas diretamente no destino`.

### 5.2 Passeio, tour ou experiência receptiva

Campos prioritários:

- duração em horas;
- dias/horários;
- ponto de encontro ou pickup;
- roteiro e paradas;
- guia e idiomas;
- privativo/compartilhado;
- acessibilidade e esforço;
- restrições e idade mínima;
- o que levar;
- política para chuva e cancelamento.

Placeholders:

- Encontro: `Recepção do hotel, entre 7h30 e 8h`.
- Duração: `Aproximadamente 8 horas`.
- O que levar: `Protetor solar, roupa de banho e documento com foto`.

### 5.3 Transfer

Campos prioritários:

- origem e destino;
- data/horário ou acompanhamento do voo;
- veículo e capacidade;
- privativo/compartilhado;
- limite de bagagem;
- tempo de espera;
- assento infantil;
- acessibilidade;
- área coberta;
- política de atraso/no-show.

Placeholders:

- Trajeto: `Aeroporto de Recife → hotéis em Porto de Galinhas`.
- Bagagem: `1 mala de até 23 kg e 1 item de mão por passageiro`.

### 5.4 Hospedagem

Campos prioritários:

- propriedade e categoria;
- localização;
- tipo de acomodação e ocupação;
- check-in/check-out;
- alimentação;
- comodidades principais;
- taxas;
- política para crianças e pets;
- cancelamento;
- acessibilidade.

Placeholders:

- Acomodação: `Apartamento duplo com varanda`.
- Regime: `Café da manhã incluso`.
- Política: `Cancelamento gratuito até 7 dias antes do check-in`.

### 5.5 Excursão ou circuito rodoviário

Campos prioritários:

- cidades/pontos de embarque;
- data e horário;
- duração;
- tipo de ônibus;
- coordenador;
- programação por dia;
- hotel, refeições e ingressos;
- mínimo de passageiros;
- bagagem;
- regras de assento;
- parcelamento e prazo de confirmação.

### 5.6 Cruzeiro

Campos prioritários:

- companhia e navio;
- porto de embarque/desembarque;
- duração e datas;
- roteiro e portos de escala;
- cabine e ocupação;
- refeições/pacotes de bebidas;
- taxas portuárias e gorjetas;
- documentação;
- bagagem;
- excursões em terra;
- políticas da companhia.

Nunca apresentar taxas, bebidas ou gorjetas como inclusas sem confirmação explícita.

### 5.7 Roteiro internacional

Além dos campos de pacote:

- países e cidades;
- voos e conexões;
- bagagem;
- idioma de serviços;
- moeda e forma de pagamento local;
- passaporte, visto e vacinas quando aplicáveis;
- seguro;
- fuso horário;
- taxas locais;
- condições de câmbio e disponibilidade.

Textos de documentação devem orientar a confirmação em fontes oficiais e não funcionar como aconselhamento definitivo.

### 5.8 Luxo ou roteiro sob medida

Campos prioritários:

- destino ou região desejada;
- duração sugerida;
- estilo de viagem;
- faixa de investimento;
- experiências disponíveis;
- padrão de hospedagem;
- grau de personalização;
- prazo para elaboração;
- o que acontece após solicitar orçamento.

### 5.9 Corporativo e eventos

Campos prioritários:

- objetivo;
- local e período;
- capacidade;
- salas e configuração;
- hospedagem e rooming list;
- logística terrestre/aérea;
- alimentação;
- audiovisual e internet;
- acessibilidade;
- suporte no local;
- escopo, prazo e contato de orçamento.

### 5.10 Aventura e ecoturismo

Campos prioritários:

- modalidade e nível de dificuldade;
- duração, distância e altimetria quando aplicável;
- idade e condicionamento mínimos;
- equipamentos inclusos e obrigatórios;
- guia/condutor e tamanho máximo do grupo;
- acessibilidade granular por etapa;
- riscos, restrições médicas e termo de ciência;
- plano para clima, emergência e cancelamento;
- itens pessoais necessários;
- práticas ambientais da atividade.

Evitar o rótulo genérico `acessível`. Informar fatos como `trajeto com escadas`, `2 km em terreno irregular` ou `veículo com espaço para cadeira dobrável`.

### 5.11 Turismo religioso

Campos prioritários:

- santuários, celebrações e cidades do roteiro;
- liderança/acompanhamento religioso, quando houver;
- datas e horários litúrgicos;
- ritmo, caminhadas e acessibilidade;
- hospedagem, alimentação e transporte;
- vestimenta ou conduta exigida nos locais;
- documentos para viagens internacionais;
- momentos livres e atividades opcionais;
- política de alterações de programação.

## 6. Estrutura dos detalhes opcionais

### Descrição completa

Ajuda: `Conte como será a experiência, para quem ela é indicada e o principal diferencial.`

### Datas e disponibilidade

Preferir dois formatos:

- período definido: início e fim;
- texto flexível: `Saídas semanais, mediante disponibilidade`.

Não forçar uma data falsa em produtos sob consulta.

### Destaques

Uma informação por linha:

```text
Piscinas naturais com guia local
Passeio de jangada
Hospedagem próxima ao centro
```

### O que inclui

Ajuda: `Adicione um item por linha. Ex.: traslado aeroporto–hotel.`

### O que não inclui

Ajuda: `Ex.: despesas pessoais, bebidas e taxas pagas no destino.`

### Roteiro

Usar itens ordenados com título e descrição:

```text
Dia 1 — Chegada: recepção no aeroporto e traslado ao hotel.
Dia 2 — Litoral: passeio de dia inteiro com paradas para banho.
```

Para experiências de horas, trocar “Dia” por “Etapa” ou horário.

### Informações importantes

Ajuda: `Documentos, restrições, acessibilidade, política de clima ou itens para levar.`

### FAQ do pacote

Perguntas sugeridas, exibidas somente se fizerem sentido:

- Posso viajar com crianças?
- O passeio é acessível?
- O que acontece em caso de chuva?
- Posso cancelar ou remarcar?
- Quais documentos preciso levar?
- O preço inclui taxas?

## 7. Regras de preenchimento e validação

- Salvar listas sem linhas vazias e sem itens duplicados.
- Preço deve aceitar valor numérico e rótulo contextual, como `por pessoa`.
- Preço público deve informar unidade, ocupação e taxas; variantes ficam em `opcoes[]`.
- Datas devem ter timezone/localidade quando um horário exato importar.
- Telefone e contato vêm da agência, não devem ser copiados para cada pacote.
- FAQ global da agência e FAQ específico do pacote são entidades diferentes.
- Não preencher automaticamente promessas comerciais, políticas ou inclusões.
- Preservar o texto original do usuário ao trocar de template.
- Campos ocultos por tipo continuam salvos; trocar a classificação não deve apagar conteúdo sem confirmação.
- Para conteúdo público, sanitizar texto e validar links.

## 8. Relação com as superfícies de publicação

Não despejar todos os dados em todas as superfícies:

- Card e capa de carrossel: resumo + até 3 fatos decisivos.
- Pop-up: 4 a 6 fatos, destaques, inclusões/exclusões, roteiro e informações importantes.
- Página completa futura: todos os detalhes, opções, políticas e FAQ.

### Carrosséis futuros

Os campos estruturados mapeiam diretamente para slides:

| Slide | Dados sugeridos |
|---|---|
| 1 — Capa | imagem, título, destino |
| 2 — Por que ir | descrição e destaques |
| 3 — O que inclui | lista de inclusões |
| 4 — Como será | roteiro/duração/datas |
| 5 — Oferta | preço, condições e CTA |

Não criar campos exclusivos de carrossel se os mesmos dados já existirem no pacote. Permitir ajustes de copy por peça somente como sobrescrita opcional.
