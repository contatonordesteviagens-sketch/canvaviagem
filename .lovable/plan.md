
# Plano: Correcao do Meta Pixel e Remocao do Boleto

## Resumo

Duas alteracoes serao feitas na pagina `/pos-pagamento`:

1. **Remover aviso de Boleto Bancario** - Eliminar toda a secao que menciona pagamento via boleto
2. **Adicionar debug do Meta Pixel** - Incluir logs para verificar se o `window.fbq` existe e se os eventos estao sendo disparados corretamente

---

## Problema Identificado com o Meta Pixel

O Pixel esta instalado corretamente no `index.html` com os 3 IDs:
- 1599242897762192
- 1152272353771099 (o seu principal)
- 4254631328136179

O console mostra `Meta Pixel: Purchase event fired (R$ 9,90)` - **o codigo esta funcionando**.

**Porem**, nao ha requisicoes de rede para o Facebook nos logs. Isso geralmente acontece quando:
- O script do Facebook esta sendo bloqueado por um **adblocker** (uBlock, AdBlock, etc.)
- O navegador tem protecao de rastreamento ativada

**Solucao**: Adicionar logs de debug mais detalhados para confirmar se `window.fbq` existe no momento do disparo.

---

## Alteracoes no Arquivo

### src/pages/PosPagamento.tsx

#### 1. Remover imports nao utilizados (linha 6)
Remover `FileText` pois nao sera mais usado (era o icone do boleto)

**De:**
```typescript
import { CheckCircle, Mail, Loader2, ArrowRight, MessageCircle, Sparkles, RefreshCw, Clock, CreditCard, FileText } from "lucide-react";
```

**Para:**
```typescript
import { CheckCircle, Mail, Loader2, ArrowRight, MessageCircle, Sparkles, RefreshCw, CreditCard } from "lucide-react";
```

#### 2. Melhorar log de debug no useEffect (linhas 18-24)
Adicionar verificacao se `window.fbq` existe para identificar bloqueadores

**De:**
```typescript
useEffect(() => {
  trackPurchase(9.90, 'BRL');
  trackSubscribe(9.90, 'BRL', 9.90 * 12);
  
  console.log('Meta Pixel: Purchase event fired (R$ 9,90)');
}, []);
```

**Para:**
```typescript
useEffect(() => {
  // Debug: verificar se o Pixel esta carregado
  console.log('[Meta Debug] window.fbq exists:', typeof window.fbq !== 'undefined');
  
  trackPurchase(9.90, 'BRL');
  trackSubscribe(9.90, 'BRL', 9.90 * 12);
  
  console.log('[Meta Debug] Purchase & Subscribe events dispatched (R$ 9,90)');
}, []);
```

#### 3. Remover secao de Boleto Bancario (linhas 125-157)
Substituir toda a secao "Payment Method Notice" por uma versao simplificada apenas com cartao de credito

**Remover completamente:**
```typescript
{/* Payment Method Notice */}
<div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-5 space-y-4">
  <h3 className="font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
    <Clock className="h-5 w-5" />
    Prazo de liberação do acesso
  </h3>
  
  <div className="space-y-3 text-sm">
    {/* Credit Card */}
    <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
      <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
      <div className="text-left">
        <p className="font-medium text-green-800 dark:text-green-200">Cartão de Crédito</p>
        <p className="text-green-700 dark:text-green-300">Acesso liberado <strong>imediatamente</strong> após a confirmação.</p>
      </div>
    </div>
    
    {/* Boleto - REMOVER COMPLETAMENTE */}
    <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
      ...
    </div>
  </div>
  
  <p className="text-xs text-amber-700 dark:text-amber-400 text-center">
    Envie o link de acesso abaixo para verificar se seu acesso está liberado.
  </p>
</div>
```

**Substituir por uma versao simples:**
```typescript
{/* Access Notice */}
<div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-5">
  <div className="flex items-center gap-3">
    <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
    <div className="text-left">
      <p className="font-semibold text-green-800 dark:text-green-200">Acesso Imediato</p>
      <p className="text-sm text-green-700 dark:text-green-300">
        Seu acesso foi liberado automaticamente apos a confirmacao do pagamento.
      </p>
    </div>
  </div>
</div>
```

---

## Resultado Final

| Antes | Depois |
|-------|--------|
| Aviso de Boleto + Cartao | Apenas aviso de acesso imediato |
| Icones Clock, FileText usados | Apenas CreditCard |
| Log simples do Pixel | Log com debug de `window.fbq` |

---

## Sobre o Rastreamento Meta

O problema de "nao marcar conversao" provavelmente e causado por:

1. **Adblockers** - Teste desativando extensoes do navegador
2. **Brave/Firefox** - Navegadores com protecao de rastreamento bloqueiam o Facebook Pixel por padrao
3. **Modo de navegacao privada** - Tambem pode bloquear

Para verificar se o Pixel esta funcionando:
- Abra o console do navegador (F12)
- Procure por `[Meta Debug] window.fbq exists: true`
- Se mostrar `false`, o script do Facebook esta sendo bloqueado

A conversao server-side (via Edge Function) so funciona para usuarios autenticados, entao para novos compradores apenas o browser-side sera utilizado.
