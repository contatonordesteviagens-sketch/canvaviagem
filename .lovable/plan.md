

# Plano: Corrigir Botao WhatsApp e Revisar Eventos Meta no Pos-Pagamento

## Problema Atual

O botao "Receber no WhatsApp" tem um comportamento confuso:
- Usa `window.open()` para redirecionar o usuario para o WhatsApp
- Abre o WhatsApp com uma mensagem para o proprio numero do usuario (sem sentido)
- O usuario sai da pagina e perde o contexto

**O correto seria:** Manter o usuario na mesma pagina e mostrar uma confirmacao simples de que o link foi enviado (seja por email ou WhatsApp).

---

## Solucao

### 1. Remover Redirecionamento do WhatsApp

O botao "Receber no WhatsApp" deve:
- Gerar o Magic Link (continua usando `generate-magic-link-url`)
- **NAO** abrir o WhatsApp externamente
- Mostrar uma mensagem de confirmacao na propria pagina
- Diferenciar se foi enviado por email ou WhatsApp

### 2. Adicionar Estado para Tipo de Envio

Criar um estado para saber qual metodo foi usado:
- `sentVia: 'email' | 'whatsapp' | null`

### 3. Mensagem de Confirmacao Diferenciada

Apos enviar:
- Se via **Email**: "Verifique sua caixa de entrada do email"
- Se via **WhatsApp**: "Verifique seu WhatsApp para o link de acesso"

### 4. Revisar Eventos Meta

Os eventos de conversao ja estao corretos:
- `trackPurchase(9.90, 'BRL')` - Dispara evento Purchase
- `trackSubscribe(9.90, 'BRL', 9.90 * 12)` - Dispara evento Subscribe com LTV

Ambos disparam **somente** quando `source=checkout` esta na URL (linhas 37-48).

**Confirmado:** Os pixels estao implementados corretamente.

---

## Alteracoes no Codigo

### Arquivo: `src/pages/PosPagamento.tsx`

#### Adicionar novo estado para tipo de envio

```typescript
const [sentVia, setSentVia] = useState<'email' | 'whatsapp' | null>(null);
```

#### Modificar handleSendMagicLink (Email)

```typescript
const handleSendMagicLink = async (e: React.FormEvent) => {
  // ... validacoes existentes ...
  
  try {
    const { data, error } = await supabase.functions.invoke("send-magic-link", {
      body: { 
        email: email.toLowerCase().trim(), 
        name: name.trim(),
        phone: phone ? cleanPhone(phone) : null
      },
    });

    if (error || !data?.success) {
      // ... tratamento de erro existente ...
      return;
    }

    setMagicLinkSent(true);
    setSentVia('email'); // <-- ADICIONAR
    toast.success("Link de acesso enviado! Verifique seu email.");
  } catch (error) {
    // ... tratamento existente ...
  }
};
```

#### Modificar handleWhatsAppAccess (Remover window.open)

```typescript
const handleWhatsAppAccess = async () => {
  if (!name.trim()) {
    toast.error("Por favor, insira seu nome.");
    return;
  }
  
  if (!email) {
    toast.error("Por favor, insira seu email.");
    return;
  }

  if (!phone) {
    toast.error("Por favor, insira seu WhatsApp.");
    return;
  }
  
  if (!isValidBRPhone(phone)) {
    toast.error("Telefone invalido. Use DDD + numero.");
    return;
  }

  setIsLoadingWhatsApp(true);

  try {
    // Gerar Magic Link URL (salva no banco com telefone)
    const { data, error } = await supabase.functions.invoke("generate-magic-link-url", {
      body: { 
        email: email.toLowerCase().trim(), 
        name: name.trim(),
        phone: cleanPhone(phone)
      },
    });

    if (error || !data?.success || !data?.magicLink) {
      toast.error("Erro ao gerar link. Tente por email.");
      console.error("WhatsApp error:", error || data?.error);
      return;
    }

    // REMOVER: window.open(whatsappUrl, "_blank");
    
    // Apenas mostrar confirmacao na pagina
    setMagicLinkSent(true);
    setSentVia('whatsapp');
    toast.success("Link de acesso gerado! Verifique seu WhatsApp.");
  } catch (error) {
    console.error("Error generating WhatsApp link:", error);
    toast.error("Erro ao processar. Tente por email.");
  } finally {
    setIsLoadingWhatsApp(false);
  }
};
```

#### Modificar Mensagem de Confirmacao

Substituir a secao de confirmacao (linhas 323-352) para mostrar mensagem diferenciada:

```tsx
{magicLinkSent && (
  <div className="space-y-4">
    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
      {sentVia === 'whatsapp' ? (
        <>
          <p className="text-green-800 dark:text-green-200 font-medium flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Link enviado para seu WhatsApp!
          </p>
          <p className="text-green-600 dark:text-green-400 text-sm mt-1">
            Verifique seu WhatsApp e clique no link de acesso. O link expira em 1 hora.
          </p>
        </>
      ) : (
        <>
          <p className="text-green-800 dark:text-green-200 font-medium flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Link enviado para {email}
          </p>
          <p className="text-green-600 dark:text-green-400 text-sm mt-1">
            Verifique sua caixa de entrada e spam. O link expira em 1 hora.
          </p>
        </>
      )}
    </div>
    
    <Button 
      variant="outline" 
      onClick={handleResendLink}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Reenviando...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reenviar Link por Email
        </>
      )}
    </Button>
  </div>
)}
```

---

## Revisao dos Eventos Meta

| Evento | Implementado | Condicao | Status |
|--------|--------------|----------|--------|
| `Purchase` | Sim | `source=checkout` | OK |
| `Subscribe` | Sim | `source=checkout` | OK |

Os eventos Meta estao **corretos**:
- Disparam apenas quando o usuario vem do checkout (Stripe redireciona com `?source=checkout`)
- Valor: R$ 9,90
- LTV para Subscribe: R$ 118,80 (9,90 x 12)

---

## Fluxo Atualizado

```text
USUARIO COMPLETA PAGAMENTO NO STRIPE
           |
           v
STRIPE REDIRECIONA PARA:
  /pos-pagamento?source=checkout
           |
           v
[Pagina /pos-pagamento]
           |
           +---> Meta Pixels disparam (Purchase + Subscribe)
           |
           +---> Usuario preenche: Nome, Email, Telefone
           |
           +---> Botao "Enviar por Email"
           |     -> Envia Magic Link por email
           |     -> Mostra: "Verifique seu email"
           |     -> Usuario permanece na pagina
           |
           +---> Botao "Receber no WhatsApp"
           |     -> Gera Magic Link no banco
           |     -> Mostra: "Verifique seu WhatsApp"
           |     -> Usuario permanece na pagina
           |
           v
USUARIO ACESSA EMAIL OU WHATSAPP PARA CLICAR NO LINK
```

---

## Beneficios

| Antes | Depois |
|-------|--------|
| Usuario redirecionado para WhatsApp externo | Usuario permanece na pagina |
| Mensagem confusa (para o proprio numero) | Confirmacao clara do metodo usado |
| Perda de contexto ao sair da pagina | Experiencia consistente |
| Possivel confusao sobre proximo passo | Instrucoes claras por metodo |

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/PosPagamento.tsx` | Remover `window.open` do WhatsApp, adicionar estado `sentVia`, mensagens diferenciadas |

