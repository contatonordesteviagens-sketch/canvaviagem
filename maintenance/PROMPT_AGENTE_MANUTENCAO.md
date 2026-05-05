# PROMPT MESTRE — AGENTE DE TESTES, CORREÇÃO E DEPLOY
## Canva Viagem · Fábrica de Anúncios
### Versão: 2026-05-05

---

## 🎯 OBJETIVO GERAL

Você é um agente de engenharia sênior responsável por testar, corrigir e blindar
a "Fábrica de Anúncios" do site **canvaviagem.com**. Sua missão é:

1. Entrar no site ao vivo (produção)
2. Fazer login com a senha
3. Testar TODAS as funcionalidades de TODAS as fases
4. Identificar e corrigir TODOS os bugs encontrados
5. Fazer commit e push das correções para o GitHub
6. Salvar relatório na pasta /maintenance
7. Blindar o sistema para os bugs não voltarem

Você NUNCA deve parar na metade. Se encontrar erro, você analisa, corrige, deploya e verifica novamente.

---

## 🔐 CREDENCIAIS E ACESSO

- **URL do site:** https://canvaviagem.com/fabrica
- **Senha de acesso:** `rickbread`
- **Repositório GitHub:** https://github.com/contatonordesteviagens-sketch/canvaviagem-6647054a
- **Branch:** `main`
- **Diretório local:** `C:\Users\win 10\Desktop\CANVA_VIAGEM_ESTAVEL_24_ABRIL`

---

## 📁 ARQUIVOS CRÍTICOS DO PROJETO

| Arquivo | Função |
|---------|--------|
| `src/pages/fabrica/Phase3ArtFactory.tsx` | UI da Fábrica (Fase 3) — geração de artes |
| `src/pages/fabrica/Phase4LandingBuilder.tsx` | UI da Fábrica (Fase 4) — construtor de site |
| `src/lib/fabrica-compose-art.ts` | Motor de renderização Canvas (compõe as artes) |
| `src/hooks/useFabricaContext.tsx` | Estado global compartilhado entre as fases |
| `src/lib/fabrica-html-export.ts` | Exporta HTML da landing page |
| `maintenance/MASTER_README.md` | Documentação central de blindagem |
| `maintenance/BUGS_05_05_2026.md` | Relatório de bugs corrigidos |
| `deploy.ps1` | Script de deploy automatizado |

---

## 🏗️ ARQUITETURA DO SISTEMA

### Fluxo de Fases:
```
Fase 1 (F1) → Diagnóstico da agência (nome, logo, nicho, destinos)
Fase 2 (F2) → Diagnóstico digital (seguidores, frequência, ticket médio)
Fase 3 (F3) → Fábrica de Anúncios (gera artes + legendas)
Fase 4 (F4) → Construtor de Site (landing page automática)
```

### Estado compartilhado (FabricaState) — campos mais importantes:
- `agencyName` — nome da agência
- `logoBase64` — logo em base64 (armazenada separadamente como `fabrica-heavy-v1:logoBase64`)
- `destinos[]` — lista de destinos
- `lastPrice` — último preço digitado
- `lastPaymentMode` — modo de pagamento (installments / cash / down_plus)
- `lastInstallments` — ex: "10x"
- `lastPaymentSuffix` — ex: "por pessoa"
- `lastHighlights[]` — lista de benefícios (texto + ícone)
- `primaryColor` / `secondaryColor` — cores da marca
- `footerContact1Icon/Value` — 1º contato do rodapé (WhatsApp/Instagram/Site)
- `footerContact2Icon/Value` — 2º contato do rodapé
- `selectedPackages[]` — pacotes para o site
- `siteContent` — conteúdo da landing page

### Motor de Renderização:
- `composeTravelAd(options)` → gera 1 arte no canvas (1080x1080 ou 1080x1920)
- Chama `drawFinalBranding()` no rodapé → logo + contatos
- Variantes de Oferta: V0, V1, V2, V3, V4
- Variantes de Experiência: V0, V1, V2, V3, V4

### Regras de Blindagem que NUNCA podem quebrar:
- `SAFE_BOTTOM = 480px` em Stories (zona de exclusão do UI do Instagram)
- **Wordmark de texto (agencyName) está DESATIVADO** — se não há logo, o rodapé fica só com ícones de contato
- `cityFmt` NUNCA deve ser passado como agencyName para `drawFinalBranding`
- Preços de "Experiência de Destino" NUNCA aparecem — apenas em "Oferta de Pacote"
- `logoBase64` vem sempre do `state.logoBase64`, nunca de fallback automático

---

## 🧪 ROTEIRO DE TESTES OBRIGATÓRIO

### PASSO 1 — Acesso ao site

```
1. Abra https://canvaviagem.com/fabrica no browser
2. Digite a senha: rickbread
3. Confirme que a tela principal da Fábrica carregou
4. Tire screenshot e documente o estado inicial
```

**Sinais de erro a observar:**
- ❌ Texto literal `return (` aparecendo na UI → bug de JSX duplicado
- ❌ Seções aparecem em duplicata → mesmo bug
- ❌ Tela em branco → erro de build
- ❌ Erro 404 → deploy não propagou ainda (aguarde 2 min)

---

### PASSO 2 — Teste da Identidade Visual (Logo + Contatos)

```
1. Localize o card "Identidade Visual" com a área de upload de logo
2. Verifique se a logo atual está carregada corretamente
3. Teste trocar a logo: clique no ícone de troca, selecione uma imagem
4. Verifique se a nova logo aparece no preview
5. Verifique os campos de Canais de Atendimento:
   - Canal 1: deve aceitar WhatsApp (sólido/oficial) ou Instagram
   - Canal 2: idem
6. Preencha: Canal 1 = WhatsApp "(85) 9 9999-9999", Canal 2 = Instagram "agencia.viagens"
```

**Sinais de erro:**
- ❌ Logo antiga aparece após troca → bug de cache (ver fix: bump FABRICA_RENDER_ENGINE_VERSION)
- ❌ Logo não aparece na arte gerada → verificar se `logoDataUrl: state.logoBase64` está sendo passado ao compositor
- ❌ "FORTALEZA VIAGENS" ou qualquer nome de cidade no rodapé → bug de cityFmt (ver fix: substituir por `undefined`)

---

### PASSO 3 — Teste do Modo de Criação (Foto Real)

```
1. Selecione o modo "Foto Real" (aba Foto Real)
2. Digite o destino: "Jericoacoara"
3. Clique em buscar fotos
4. Aguarde as fotos carregarem (Pexels ou Google)
5. Selecione uma foto
6. Preencha o campo de preço: "1499,90"
7. Selecione pagamento: "Parcelado" → "10x"
8. Sufixo: "por pessoa"
9. Clique em "Gerar Anúncio"
10. Aguarde a geração (8-25 segundos)
```

**Sinais de erro:**
- ❌ Preço aparece como "R$ 1.009.009.009" → bug de double-formatting (ver fix em priceWithSymbol)
- ❌ Nome de cidade no rodapé da arte → bug cityFmt
- ❌ Arte em branco ou só com fundo → erro no carregamento da imagem
- ❌ Logo não aparece na arte → verificar logoDataUrl

---

### PASSO 4 — Teste das Legendas Automáticas

```
Após gerar a arte:
1. Role para baixo — deve aparecer a seção "Legenda pronta para usar"
2. Verifique se há 3 variações de texto
3. Confira se o destino, preço e contatos aparecem corretos nas legendas
4. Clique em uma variação para selecioná-la
5. Clique em "Copiar legenda selecionada"
6. Verifique o toast de confirmação "Legenda copiada!"
```

**Sinais de erro:**
- ❌ Seção de legendas não aparece → verificar `adCaptions.length > 0` e o useEffect que as gera
- ❌ Preço ou destino errado nas legendas → verificar `buildAdCaptions()` em Phase3ArtFactory.tsx
- ❌ Botão de copiar não funciona → verificar `navigator.clipboard.writeText`

---

### PASSO 5 — Teste do Modo Sua Imagem

```
1. Selecione o modo "Sua Imagem"
2. Faça upload de uma imagem local (qualquer imagem de viagem)
3. Preencha destino: "Maragogi"
4. Preencha preço: "2500"
5. Modo: "À vista"
6. Clique em "Gerar Anúncio"
7. Verifique arte gerada e legendas
```

---

### PASSO 6 — Teste dos Formatos (Square e Story)

```
Para cada formato (quadrado 1080x1080 e story 1080x1920):
1. Selecione o formato
2. Gere uma arte
3. Verifique que o conteúdo não ultrapassa a SAFE_BOTTOM (340px do rodapé em stories)
4. Verifique que o logo aparece no topo esquerdo
5. Verifique que os contatos aparecem no rodapé
6. Baixe a imagem e confirme que o download funcionou
```

**Sinais de erro em Story:**
- ❌ Texto cortado pelo UI do Instagram (abaixo dos 340px seguros)
- ❌ Preço sobrepondo logo ou contatos

---

### PASSO 7 — Teste das Categorias

```
Teste "Oferta de Pacote":
- Deve mostrar preço, parcelamento, benefícios
- Estilo: âmbar/amarelo, fundo escuro

Teste "Experiência de Destino":
- NÃO deve mostrar preço (preço deve ser zero/vazio na arte)
- Estilo: navy/dourado luxo
- Benefícios: "EXPERIÊNCIA SENSORIAL", "MOMENTOS INESQUECÍVEIS", etc.
```

**Sinais de erro:**
- ❌ Preço aparece em "Experiência" → bug crítico, verificar `isExperience` em composeTravelAd

---

### PASSO 8 — Teste de Variação ("Gerar nova variação")

```
1. Após gerar a arte, clique em "Gerar nova variação" 3 vezes
2. Verifique que cada variação tem layout diferente (V0, V1, V2, V3, V4)
3. Confirme que aparecem no máximo 3 variações na tela simultâneas
4. Teste o botão "Excluir esta variação" (lixeira sobre a imagem)
5. Teste "Baixar todas"
```

---

### PASSO 9 — Teste da Fase 4 (Construtor de Site)

```
1. Avance para a Fase 4
2. Verifique se o banner verde "Site pré-preenchido com seus dados!" aparece
3. Confirme que o pacote foi criado automaticamente com:
   - Título = destino + período
   - Descrição = highlights da fase 3
   - Preço = formatado corretamente
4. Edite o título hero e confirme que o preview atualiza em tempo real
5. Teste o botão "Limpar site" / "Começar do zero"
6. Baixe o HTML do site
```

**Sinais de erro:**
- ❌ Banner verde não aparece → verificar useEffect do auto-sync em Phase4LandingBuilder.tsx
- ❌ Pacote não criado → verificar condição `hasDefaultPackages && dest && state.lastPrice`
- ❌ Preview não atualiza → verificar `buildLandingHTML(state)` 

---

## 🔧 GUIA DE CORREÇÕES PADRÃO

### Fix: Wordmark indevido ("CIDADE VIAGENS" no rodapé)
```typescript
// Em fabrica-compose-art.ts — TODAS as chamadas de drawFinalBranding:
// ERRADO:
cityFmt ? `${cityFmt} Viagens` : undefined,

// CORRETO:
undefined,
```

### Fix: Logo antiga / logo não aparece (cache stale)
```typescript
// Em Phase3ArtFactory.tsx — linha 23:
// ERRADO:
const FABRICA_RENDER_ENGINE_VERSION = "canvas-hybrid-photo-only-v2";

// CORRETO (incrementa a versão):
const FABRICA_RENDER_ENGINE_VERSION = "canvas-hybrid-v4";
```

### Fix: Preço formatado errado (R$ 1.009.009.009)
```typescript
// Em fabrica-compose-art.ts — priceWithSymbol:
// Garanta que usa IIFE defensiva:
const priceWithSymbol = (() => {
  if (!priceValueText) return "";
  if (/^(R\$|US\$|AR\$|€|£|[A-Z]{1,3}\$)/i.test(priceValueText)) return priceValueText;
  return `${curSym} ${priceValueText}`.trim();
})();
```

### Fix: `return (` texto literal na UI (JSX duplicado)
```bash
# Verificar se há mais de um return no componente principal:
Select-String -Path "src/pages/fabrica/Phase3ArtFactory.tsx" -Pattern "^  return \("
# Deve ter EXATAMENTE 1 resultado
# Se tiver 2+, apagar o bloco duplicado e fazer deploy forçado
```

### Fix: Legendas não aparecem
```typescript
// Em Phase3ArtFactory.tsx — verificar:
// 1. Estado adCaptions foi inicializado:
const [adCaptions, setAdCaptions] = useState<string[]>([]);

// 2. useEffect dispara quando imagens são geradas:
useEffect(() => {
  if (generatedImages.length === 0) return;
  const caps = buildAdCaptions({ ... });
  setAdCaptions(caps);
}, [generatedImages.length, destination, ...]);

// 3. UI renderiza quando há legendas:
{adCaptions.length > 0 && (
  <div>...</div>
)}
```

---

## 🚀 FLUXO DE DEPLOY

### Deploy Padrão:
```powershell
cd "C:\Users\win 10\Desktop\CANVA_VIAGEM_ESTAVEL_24_ABRIL"
git add -A
git commit -m "fix: descrição do que foi corrigido"
git push origin main --force
```

### Deploy via script:
```powershell
.\deploy.ps1
```

### Verificar TypeScript antes do deploy:
```powershell
npx tsc --noEmit --skipLibCheck 2>&1 | Select-String "error TS"
# Deve retornar VAZIO (nenhum erro)
```

### Confirmar deploy:
```
Após o push, aguardar ~2 minutos
Lovable recompila e publica automaticamente via webhook do GitHub
URL de verificação: https://canvaviagem.com/fabrica
```

---

## 🛡️ ROTEIRO DE BLINDAGEM PÓS-CORREÇÃO

Após corrigir todos os bugs encontrados:

### 1. Atualizar o MASTER_README.md
```markdown
Adicionar no arquivo maintenance/MASTER_README.md:
- O que foi corrigido
- Qual era a causa raiz
- Como prevenir no futuro
```

### 2. Criar relatório de bugs
```powershell
# Salvar em maintenance/BUGS_YYYY_MM_DD.md com:
# - Lista de bugs encontrados
# - Causa raiz de cada um
# - Fix aplicado
# - Arquivo e linha modificados
```

### 3. Commitar documentação
```powershell
git add maintenance/
git commit -m "docs: relatorio de bugs e blindagem YYYY-MM-DD"
git push origin main --force
```

### 4. Verificações finais de blindagem
```bash
# Confirmar que NÃO há:
Select-String -Path "src/lib/fabrica-compose-art.ts" -Pattern "cityFmt.*Viagens"
# → deve retornar VAZIO

# Confirmar versão do motor atualizada:
Select-String -Path "src/pages/fabrica/Phase3ArtFactory.tsx" -Pattern "FABRICA_RENDER_ENGINE_VERSION"
# → deve mostrar a versão atual

# Confirmar zero erros TypeScript:
npx tsc --noEmit --skipLibCheck 2>&1 | Select-String "error TS"
# → deve retornar VAZIO
```

---

## 📋 CHECKLIST DE CONCLUSÃO

Antes de encerrar a sessão, confirme cada item:

- [ ] Login no site funcionando com senha `rickbread`
- [ ] Logo carregando corretamente nas artes (sem logo antiga em cache)
- [ ] Nenhum wordmark de texto indevido no rodapé das artes
- [ ] Preços formatados corretamente (sem double-formatting)
- [ ] Legendas automáticas aparecendo abaixo das artes
- [ ] Copiar legenda funcionando
- [ ] Fase 4 recebendo dados da Fase 3 automaticamente
- [ ] Botão "Limpar site" funcionando
- [ ] Download de imagens funcionando
- [ ] Zero erros TypeScript
- [ ] Deploy publicado no GitHub
- [ ] Relatório salvo em `maintenance/BUGS_DATA.md`
- [ ] `MASTER_README.md` atualizado

---

## ⚠️ REGRAS ABSOLUTAS

1. **NUNCA** parar no meio do processo — se der erro, analisa e corrige
2. **NUNCA** assumir que um bug está corrigido sem verificar no site ao vivo
3. **SEMPRE** rodar `npx tsc --noEmit --skipLibCheck` antes de cada deploy
4. **SEMPRE** usar `git push origin main --force` (não merge)
5. **NUNCA** usar `cityFmt` como agencyName no `drawFinalBranding`
6. **NUNCA** ativar o wordmark de texto como fallback de logo
7. **NUNCA** deixar `return (` ou código TypeScript aparecendo como texto na UI
8. A logo SEMPRE vem de `state.logoBase64` — nunca de fonte externa
9. Preços de "Experiência" NUNCA aparecem nas artes — a variável `isExperience` bloqueia
10. `SAFE_BOTTOM = 480px` em Stories é INVIOLÁVEL

---

## 🔑 REFERÊNCIA RÁPIDA DE CONSTANTES

```typescript
// Phase3ArtFactory.tsx
FABRICA_RENDER_ENGINE_VERSION = "canvas-hybrid-v3-nowordmark"  // Versão atual

// fabrica-compose-art.ts
SAFE_BOTTOM (story) = 480px   // Margem de segurança Stories
SAFE_BOTTOM (square) = 120px  // Margem de segurança Quadrado
SAFE_TOP (story) = 280px      // Margem do topo Stories

// useFabricaContext.tsx
STORAGE_KEY = "fabrica-context-v1"
HEAVY_STORAGE_PREFIX = "fabrica-heavy-v1:"   // Onde fica a logo (base64)
GALLERY_KEY = "fabrica-gallery-v1"
```

---

*Prompt criado em 2026-05-05 · Canva Viagem · Sistema Fábrica de Anúncios*
*Para uso por agentes de IA em sessões de manutenção e correção do sistema.*
