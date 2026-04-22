# SEO — Histórico e Guia de Manutenção
**canvaviagem.com** | Última atualização: 22/04/2026

---

## Diagnóstico Inicial (22/04/2026)

`site:canvaviagem.com` no Google retornou **zero resultados**.

**Causa raiz:** O site é uma React SPA (Vite) — o Googlebot via apenas `<div id="root"></div>` vazio antes do JavaScript executar. Sem conteúdo estático, nenhuma página era indexada.

---

## O que foi implementado (22/04/2026)

### 1. Prerendering com react-snap
- Instalado `react-snap` como devDependency
- Configurado `puppeteerExecutablePath` para usar Chrome do sistema (`C:\Program Files\Google\Chrome\Application\chrome.exe`)
- Adicionado `"postbuild": "react-snap"` — roda automaticamente após `npm run build`
- **Resultado: 39 páginas geram HTML estático** com conteúdo real renderizado

**Páginas prerendered:**
- `/` — Homepage
- `/planos` — Página de planos
- `/blog` — Índice do blog
- 30 artigos do blog individualmente (BlogPost1–30)
- `/termos`, `/privacidade`

### 2. main.tsx atualizado para hydration
```tsx
// React 18 — usa hydrateRoot quando HTML já foi pré-renderizado
const rootElement = document.getElementById("root")!;
if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, <App />);
} else {
  createRoot(rootElement).render(<App />);
}
```

### 3. SeoMetadata corrigido
- Título antigo: "150 vídeos por R$47" → **"250+ vídeos por R$16,41/mês"**
- Description atualizada com calendário editorial e IA

### 4. Noscript com keywords
Bloco `<noscript>` adicionado ao `index.html` com H1, H2 e keywords principais para Googlebot sem JS.

### 5. Sitemap atualizado
- Datas `lastmod` atualizadas para `2026-04-22`
- Sitemap já estava correto com 33 páginas
- **Nota:** As alterações de data não chegaram ao prod porque o push falhou (ver seção GitHub abaixo)

---

## Google Search Console — Status (22/04/2026)

| Item | Status |
|------|--------|
| Propriedade | canvaviagem.com ✅ verificada |
| Sitemap | https://canvaviagem.com/sitemap.xml ✅ processado |
| Páginas encontradas | 33 |
| Última leitura | 18/03/2026 (nova leitura pendente) |

### Ações feitas no Search Console
- ✅ Sitemap `sitemap.xml` já estava adicionado e processado
- ❌ `/planos` adicionado como sitemap por engano → **deletar**
- ❌ `/blog` adicionado como sitemap por engano → **deletar**

### Ações pendentes no Search Console
- [ ] Deletar `/planos` e `/blog` da lista de sitemaps
- [ ] Clicar em "Reenviar" no `sitemap.xml`
- [ ] Inspeção de URL → solicitar indexação de `/`, `/planos`, `/blog`

---

## Problemas de indexação identificados

| Problema | Qtd | Diagnóstico | Ação |
|----------|-----|-------------|------|
| Página com redirecionamento | 2 | Rota `/pt` redireciona para `/` — normal | Nenhuma |
| Bloqueada por 4xx | 1 | URL quebrada encontrada pelo Google | Verificar no Search Console qual URL |
| Bloqueada pelo robots.txt | 1 | Provavelmente `/api/` — correto | Nenhuma |
| Alternativa com canônica | 1 | `/pt` ou `/es` duplicada — normal | Nenhuma |

---

## Concorrentes mapeados

### Concorrentes diretos (produto similar)
| Site | Modelo | Diferença vs Canvaviagem |
|------|--------|--------------------------|
| canva.com/templates/travel | Templates genéricos gratuitos | Não é focado em agente BR, sem IA, sem calendário |
| adsbysarajesus.pt | Pack 900 Reels €9,90 (venda única) | Sem assinatura, sem calendário, sem IA |
| studiokako.com | Pack 35 artes avulsas | Muito limitado |

### Concorrentes de conteúdo (quem rankeia nas nossas keywords)
| Site | Rankeia para |
|------|-------------|
| nodigital.me | "365 ideias de posts para agência de turismo" |
| paytour.com.br | "ideias de posts para turismo" |
| proposeful.com | "o que postar no Instagram agência de viagens" |
| veronicaolliveira.com.br | "ideias de posts para agência de viagens" |
| cesardedeus.com.br | "ideias de conteúdo para agência de viagens" |

---

## Keywords prioritárias

| Keyword | Concorrência | Oportunidade |
|---------|-------------|--------------|
| "vídeos prontos para agência de viagem" | **Zero** | 🔥 Ouro — ninguém ranqueia |
| "conteúdo para agência de viagem instagram" | Média | Alta |
| "o que postar no instagram agência de viagem" | Média | Alta |
| "reels para agência de viagem" | Baixa | Alta |
| "marketing digital para agência de viagem" | Alta | Média |
| "templates canva agência de viagem" | Média | Alta |

---

## Próximos passos SEO

### Curto prazo (próximas 2 semanas)
- [ ] Acompanhar indexação no Search Console
- [ ] Verificar se `site:canvaviagem.com` começa a retornar resultados
- [ ] Investigar a URL com erro 4xx no Search Console

### Médio prazo (1–3 meses)
- [ ] Criar página dedicada `/videos-prontos-agencia-de-viagem` (keyword sem concorrência)
- [ ] Criar `/templates-instagram-agencia-de-viagem`
- [ ] Otimizar artigos do blog com mais texto (mín. 1.500 palavras cada)
- [ ] Adicionar CTAs internos em todos os artigos linkando para `/planos`

### Longo prazo (3–6 meses)
- [ ] Guest posts em paytour.com.br, monde.com.br, nodigital.me
- [ ] Infográfico "Calendário de conteúdo para agência de viagem" (isca de backlinks)
- [ ] Meta: Top 3 no Google para 20 keywords de alta intenção

---

## Como rodar o build com prerendering

```bash
cd "C:/Users/win 10/Desktop/canvaviagem-repo"
npm run build
# O postbuild roda react-snap automaticamente
# 39 páginas são geradas como HTML estático em /dist
```

**Importante:** Sempre rodar o build antes de publicar alterações em páginas públicas.

---

## GitHub — Configuração de contas

**Problema:** Dois repositórios GitHub com contas diferentes causavam erro de permissão.

**Solução:** SSH com chaves separadas por conta.

| Conta | Host SSH | Repositórios |
|-------|----------|--------------|
| `lucasferraripro` | `github-lucas` | Lovisa, 321go, meguiaviagens, asasbrasilviagens |
| `contatonordesteviagens-sketch` | `github-canva` | canvaviagem |

**Chaves criadas em:** `C:/Users/win 10/.ssh/`
- `github_lucasferraripro` + `.pub`
- `github_canvaviagem` + `.pub`
- `config` — mapa de hosts

**Remote atual do projeto:**
```
git@github-canva:contatonordesteviagens-sketch/canvaviagem.git
```

**Para push funcionar:** Cadastrar a chave pública `github_canvaviagem.pub` no GitHub da conta `contatonordesteviagens-sketch` em Settings → SSH Keys.

---

## Skills disponíveis para SEO

| Skill | Quando usar |
|-------|------------|
| `canvaviagem_seo` | Otimização on-page, meta tags, headings dos artigos |
| `dept-seo-authority` | Estratégia completa, prioridades, equipe SEO |
| `canvaviagem_blog` | Produzir novos artigos SEO (2.000+ palavras) |
| `seo-content-audit` | Audit completo do site a cada trimestre |
| `traffic-campaign-analyzer` | Analisar performance quando houver dados no Search Console |
| `page-audit-brutal` | Auditar páginas específicas antes de publicar |

**Para rodar um novo audit completo:**
```
use a skill seo-content-audit para canvaviagem.com
```
