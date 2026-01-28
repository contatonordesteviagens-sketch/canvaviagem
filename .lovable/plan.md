
# Plano: Importacao Inteligente de Legendas com IA

## Resumo

Implementar sistema que analisa os 2 arquivos de legendas enviados e faz match automatico com os 96 videos existentes no banco de dados, aplicando as legendas correspondentes.

---

## Arquivos de Legendas Analisados

### Arquivo 1: LEGENDAS_-_AGENCIAS_DE_VIAGENS_VIDEOS.txt (1507 linhas)
Contem legendas especificas por destino:
- Destinos Nacionais: Maragogi, Salvador, Trancoso, Jalapao, Foz do Iguacu, Florianopolis, Gramado, Natal, Fortaleza, Pantanal, Recife, Balneario Camboriu, Alter do Chao, Arraial do Cabo, Rota das Emocoes, Maceio, Lencois Maranhenses, Fernando de Noronha, Angra dos Reis, Jericoacoara, Porto de Galinhas, Amazonia, Rio de Janeiro, Alagoas, Ouro Preto, Genipabu...
- Destinos Internacionais: Cuzumel, Filipinas, Namibia, Montevideu, Fort Lauderdale, Lisboa, Paris, Nova Zelandia, Taiwan, Cusco, Egito, Washington, Chicago, Ushuaia, Boston, Machu Picchu, Salar de Uyuni, Cancun, Israel, Bruxelas, Dublin, Jordania, Africa, Punta Cana, Praga, New York, Grecia, Singapura, Maldivas, Berlim, Roma, Istambul, Santiago, Frankfurt, Bangkok, Munique, Dubai, Buenos Aires, Phuket, Ilha de Pascoa, Bali, Havana, Toronto, Sydney, Londres, Amsterda, Madri, Cartagena, Veneza, Milao, Hong Kong, Barcelona, Atenas, Italia, Tulum, Los Angeles, Tokyo, Miami, Las Vegas, Vancouver, Playa del Carmen, Florenca, Riviera Maya...

### Arquivo 2: LEGENDAS_AGENCIA_DE_VIAGEM.txt (482 linhas)
Contem legendas genericas numeradas (ARTE 1 a ARTE 33+):
- Legendas para dicas de viagem
- Legendas de promocoes
- Legendas de destinos especificos (Maragogi, Rio de Janeiro, Jericoacoara, Maldivas, Cancun, Ibiza...)

---

## Videos no Banco de Dados (96 videos)

### Videos SEM legenda (description = null): ~95 videos
Exemplos: Jericoacoara Takes 2, Miami, Madri, Fortaleza - CE, Maceio - AL 2, Pantanal, Trancoso - BA, Florianopolis - SC, Alagoas, Alter do Chao, Foz do Iguacu, Joao Pessoa, Tailandia, Ouro Preto, Munique, Havana 2, Salvador - BA, Rio de Janeiro 2, Las Vegas, Balneario Camboriu, Maragogi - AL, 5 Praias Floripa, Orlando, Santiago, Fernando de Noronha, Arraial do Cabo, Maragogi, Angra dos Reis, Lencois Maranhenses, Amazonia, Paris, Rio de Janeiro, Ushuaia, Lima, Vale Sagrado, Washington, Jordania, Amsterda 2, Rota das Emocoes 2, Veneza, Porto de Galinhas, Recife, Jericoacoara - CE, Rota das Emocoes, Taiwan, Punta Cana, Natal -, Lisboa, Genipabu, Natal - RN, Maldivas, Sydney, Machu Picchu, Nova Zelandia, Montevideu, New York, Namibia, Playa Del Carmen, Sao Francisco, Jericoacoara, Jericoacoara takes, Green Island, Vancouver, Dubai, Vale Sagrado, 5 Lugares Europa...

### Videos COM legenda: 1 video
- Mel Africa (ja possui legenda completa sobre Africa do Sul)

---

## Implementacao Tecnica

### 1. Nova Edge Function: match-captions-to-videos

| Arquivo | Descricao |
|---------|-----------|
| `supabase/functions/match-captions-to-videos/index.ts` | Processa arquivo de legendas e usa IA para fazer match com videos |

Funcionalidades:
- Recebe conteudo do arquivo de legendas
- Busca videos sem legenda do banco de dados
- Usa Lovable AI (google/gemini-3-flash-preview) para:
  - Identificar destinos nas legendas
  - Fazer match inteligente com titulos de videos
  - Adaptar legendas removendo telefones genericos
- Retorna sugestoes de match para revisao

### 2. Novo Hook: useImportCaptions

| Arquivo | Descricao |
|---------|-----------|
| `src/hooks/useImportCaptions.ts` | Gerencia estado e chamadas para importacao de legendas |

Funcionalidades:
- `processFile()`: Envia arquivo para edge function
- `toggleVideoSelection()`: Seleciona/deseleciona videos
- `updateVideoCaption()`: Edita legenda sugerida
- `applyMatches()`: Aplica legendas selecionadas ao banco
- `getStats()`: Retorna estatisticas de selecao

### 3. Novo Componente: CaptionMatchTable

| Arquivo | Descricao |
|---------|-----------|
| `src/components/gestao/CaptionMatchTable.tsx` | UI para revisar e aplicar matches |

Funcionalidades:
- Lista matches agrupados por destino
- Checkbox para selecionar/deselecionar videos
- Badge de confianca (Exato/Parcial/Contexto)
- Edicao inline da legenda antes de aplicar
- Botao "Aplicar Selecionados"

### 4. Atualizar ImportSection

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/gestao/ImportSection.tsx` | Adicionar aba "Legendas em Massa" |

Nova aba com:
- Upload/paste de arquivo de legendas
- Checkbox "Incluir videos que ja tem legenda"
- Botao "Processar com IA"
- Tabela de matches sugeridos

### 5. Atualizar config.toml

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/config.toml` | Adicionar configuracao da nova function |

```toml
[functions.match-captions-to-videos]
verify_jwt = false
```

---

## Fluxo de Uso

```text
GESTAO > IMPORTAR > Aba "Legendas em Massa"
        |
        v
  [Cole ou upload arquivo de legendas]
        |
        v
  [Clique "Processar com IA"]
        |
        v
  IA analisa e retorna matches:
  +----------------------------------+
  | Destino: Jericoacoara            |
  | Videos: 4 encontrados            |
  |----------------------------------|
  | [x] Jericoacoara - CE     [Exato]|
  | [x] Jericoacoara Takes 2  [Exato]|
  | [x] Jericoacoara takes    [Exato]|
  | [x] Jericoacoara          [Exato]|
  |----------------------------------|
  | Legenda: "Relaxe em Jericoa..."  |
  +----------------------------------+
        |
        v
  [Revisar, editar se necessario]
        |
        v
  [Clique "Aplicar Selecionados"]
        |
        v
  Videos atualizados com badge "Com legenda"
```

---

## Matches Esperados (Exemplos)

| Destino no Arquivo | Videos que fazem Match |
|--------------------|------------------------|
| Jericoacoara - CE | Jericoacoara - CE, Jericoacoara, Jericoacoara takes, Jericoacoara Takes 2 |
| Maragogi - AL | Maragogi - AL, Maragogi |
| Salvador - BA | Salvador - BA |
| Florianopolis - SC | Florianopolis - SC, 5 Praias Floripa |
| Fernando de Noronha | Fernando de Noronha |
| Rio de Janeiro | Rio de Janeiro, Rio de Janeiro 2 |
| Foz do Iguacu | Foz do Iguacu |
| Paris | Paris |
| Dubai | Dubai |
| Maldivas | Maldivas |
| Cancun | (se existir) |
| Las Vegas | Las Vegas |
| Miami | Miami |
| New York | New York |
| Munique | Munique |
| Punta Cana | Punta Cana |
| Santiago | Santiago |
| Ushuaia | Ushuaia |
| Machu Picchu | Machu Picchu |
| Jordania | Jordania |
| Taiwan | Taiwan |
| Sydney | Sydney |
| Lisboa | Lisboa |
| Veneza | Veneza |
| Havana | Havana 2 |
| Amsterda | Amsterda 2 |

---

## Arquivos a Criar/Modificar

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `supabase/functions/match-captions-to-videos/index.ts` | Novo | Edge function com IA |
| `src/hooks/useImportCaptions.ts` | Novo | Hook para gerenciar importacao |
| `src/components/gestao/CaptionMatchTable.tsx` | Novo | Componente de tabela de matches |
| `src/components/gestao/ImportSection.tsx` | Modificar | Adicionar aba de legendas |
| `supabase/config.toml` | Modificar | Adicionar funcao |

---

## Secao Tecnica

### Prompt da IA para Matching

A edge function usara o seguinte prompt para fazer o match:

```text
TAREFA: Analise legendas e faca match com videos disponiveis.

REGRAS DE MATCHING:
1. Identifique o destino principal de cada legenda
2. Faca match com videos que tenham o mesmo destino ou similares
3. Regras de similaridade:
   - "Jericoacoara", "Jeri", "Jericoacoara - CE" = mesmo destino
   - "Maragogi", "Maragogi - AL" = mesmo destino
   - Variacoes com "2", "Takes", "Pacote" = mesmo destino
4. Remova telefones genericos (99) 9 9999-9999 e substitua por (00) 00000-0000
5. Confidence score: 100 (exato), 80 (parcial), 60 (contexto)
```

### Interface de Tipos

```typescript
interface CaptionMatch {
  destination: string;
  caption: string;
  matchedVideos: Array<{
    videoId: string;
    videoTitle: string;
    adaptedCaption: string;
    confidence: number;
    selected?: boolean;
  }>;
}
```

---

## Criterios de Aceitacao

- [ ] Upload/paste de arquivo de legendas funciona
- [ ] IA identifica destinos corretamente nas legendas
- [ ] Match inteligente com titulos de videos
- [ ] Usuario pode revisar e editar matches antes de aplicar
- [ ] Usuario pode selecionar/deselecionar videos individuais
- [ ] Atualizacao em massa funciona corretamente
- [ ] Videos atualizados mostram badge "Com legenda"
- [ ] Telefones genericos sao substituidos

