
# Plano: Sistema Multi-idioma e Refatoracao Arquitetural

## Resumo Executivo

Este plano implementa o sistema multi-idioma (PT/EN/ES) e refatora a arquitetura de autenticacao conforme o prompt oficial. As mudancas sao significativas e afetam:
- Webhook do Stripe
- Estrutura do banco de dados
- Templates de e-mail
- Frontend (hook de idioma + UI)

---

## Mudancas Arquiteturais Principais

### ANTES (Atual)
```
Stripe webhook -> Cria usuario via Admin API -> profiles/subscriptions vinculados a user_id
```

### DEPOIS (Novo)
```
Stripe webhook -> Apenas popula profiles/subscriptions por EMAIL -> Magic Link cria usuario
```

---

## Fase 1: Migracao do Banco de Dados

### 1.1 Adicionar campo `language` na tabela `profiles`

```sql
-- Adicionar campo language com check constraint
ALTER TABLE profiles 
ADD COLUMN language text DEFAULT 'pt' 
CHECK (language IN ('pt', 'en', 'es'));

-- Criar indice para performance
CREATE INDEX idx_profiles_language ON profiles(language);
CREATE INDEX idx_profiles_email ON profiles(email);
```

### 1.2 Criar indice adicional em subscriptions

```sql
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(stripe_customer_id);
```

---

## Fase 2: Refatorar Webhook do Stripe

### Arquivo: `supabase/functions/stripe-webhook/index.ts`

### Mudancas principais:

1. **REMOVER** criacao de usuario via Admin API (linhas 168-190)
2. **ADICIONAR** deteccao de idioma via metadata
3. **ATUALIZAR** upsert para usar email como chave
4. **INTERNACIONALIZAR** todos os templates de e-mail

### Novo fluxo `handleCheckoutCompleted`:

```typescript
async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any, resend: any) {
  logStep("Processing checkout.session.completed", { sessionId: session.id });

  const rawEmail = session.customer_email || session.customer_details?.email;
  
  if (!isValidEmail(rawEmail)) {
    logStep("ERROR: Invalid or missing email in session");
    return;
  }
  
  const email = rawEmail.toLowerCase();
  const stripeCustomerId = session.customer as string;
  const stripeSubscriptionId = session.subscription as string;

  // Detectar idioma do metadata ou fallback para 'pt'
  const detectedLanguage = 
    session.metadata?.language || 
    session.metadata?.locale?.substring(0, 2) ||
    'pt';
  
  const validLanguages = ['pt', 'en', 'es'];
  const userLanguage = validLanguages.includes(detectedLanguage) ? detectedLanguage : 'pt';

  logStep("Checkout details", { 
    email: redactEmail(email), 
    stripeCustomerId, 
    language: userLanguage 
  });

  // NAO CRIAR USUARIO - apenas popular tabelas customizadas

  // Upsert profile com idioma (por stripe_customer_id ou criar novo)
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      email,
      stripe_customer_id: stripeCustomerId,
      language: userLanguage,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "stripe_customer_id",
      ignoreDuplicates: false,
    });

  if (profileError) {
    // Tentar inserir novo se nao existir
    const { error: insertError } = await supabase
      .from("profiles")
      .insert({
        user_id: crypto.randomUUID(), // Placeholder ate Magic Link
        email,
        stripe_customer_id: stripeCustomerId,
        language: userLanguage,
      });
    
    if (insertError) {
      logStep("ERROR: Failed to upsert/insert profile", { error: insertError.message });
    }
  }

  // Criar ou atualizar subscription (por stripe_customer_id)
  const { error: subError } = await supabase
    .from("subscriptions")
    .upsert({
      user_id: crypto.randomUUID(), // Placeholder
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      status: "active",
      product_id: "prod_TkvaozfpkAcbpM",
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "stripe_customer_id",
    });

  if (subError) {
    logStep("ERROR: Failed to upsert subscription", { error: subError.message });
  }

  logStep("Profile and subscription created/updated successfully");

  // Enviar e-mail de boas-vindas no idioma correto
  if (resend) {
    await sendWelcomeEmail(resend, email, userLanguage);
  }
}
```

### Templates de E-mail Internacionalizados:

```typescript
const emailTemplates = {
  welcome: {
    pt: {
      subject: "Acesso Liberado: Bem-vindo ao Canva Viagens!",
      heading: "Bem-vindo ao Canva Viagens!",
      confirmed: "Pagamento Confirmado com Sucesso!",
      intro: "E oficial: voce faz parte do grupo seleto de agentes que usam tecnologia de ponta para vender mais.",
      cta: "Acessar Minha Plataforma",
      support: "Precisa de suporte VIP?",
    },
    en: {
      subject: "Access Granted: Welcome to Canva Viagens!",
      heading: "Welcome to Canva Viagens!",
      confirmed: "Payment Confirmed Successfully!",
      intro: "It's official: you're now part of the select group of agents using cutting-edge technology to sell more.",
      cta: "Access My Platform",
      support: "Need VIP support?",
    },
    es: {
      subject: "Acceso Liberado: Bienvenido a Canva Viagens!",
      heading: "Bienvenido a Canva Viagens!",
      confirmed: "Pago Confirmado con Exito!",
      intro: "Es oficial: ahora formas parte del grupo selecto de agentes que usan tecnologia de punta para vender mas.",
      cta: "Acceder a Mi Plataforma",
      support: "Necesitas soporte VIP?",
    },
  },
  cancellation: {
    pt: {
      subject: "Sentiremos sua falta (e seus resultados tambem...)",
      heading: "Sua assinatura foi pausada",
      cta: "Quero Reativar Agora",
    },
    en: {
      subject: "We'll miss you (and your results too...)",
      heading: "Your subscription has been paused",
      cta: "I Want to Reactivate Now",
    },
    es: {
      subject: "Te extranaremos (y tus resultados tambien...)",
      heading: "Tu suscripcion ha sido pausada",
      cta: "Quiero Reactivar Ahora",
    },
  },
  paymentFailed: {
    pt: {
      subject: "Acao Necessaria: Evite o bloqueio do seu marketing",
      heading: "O pagamento falhou",
      cta: "Atualizar Cartao Agora",
    },
    en: {
      subject: "Action Required: Avoid blocking your marketing",
      heading: "Payment failed",
      cta: "Update Card Now",
    },
    es: {
      subject: "Accion Requerida: Evita el bloqueo de tu marketing",
      heading: "El pago fallo",
      cta: "Actualizar Tarjeta Ahora",
    },
  },
};
```

---

## Fase 3: Hook de Idioma no Frontend

### Novo arquivo: `src/hooks/useLanguage.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const VALID_LANGUAGES = ['pt', 'en', 'es'] as const;
type Language = typeof VALID_LANGUAGES[number];

export function useLanguage() {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>('pt');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function detectLanguage() {
      // 1. URL param (?lang=en)
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang') as Language;
      
      if (urlLang && VALID_LANGUAGES.includes(urlLang)) {
        setLanguageState(urlLang);
        localStorage.setItem('preferredLanguage', urlLang);
        setLoading(false);
        return;
      }

      // 2. localStorage
      const savedLang = localStorage.getItem('preferredLanguage') as Language;
      if (savedLang && VALID_LANGUAGES.includes(savedLang)) {
        setLanguageState(savedLang);
        setLoading(false);
        return;
      }

      // 3. Profile do usuario (se autenticado)
      if (user?.email) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('language')
          .eq('email', user.email)
          .single();

        if (profile?.language && VALID_LANGUAGES.includes(profile.language)) {
          setLanguageState(profile.language);
          localStorage.setItem('preferredLanguage', profile.language);
          setLoading(false);
          return;
        }
      }

      // 4. Browser locale fallback
      const browserLang = navigator.language.substring(0, 2) as Language;
      if (VALID_LANGUAGES.includes(browserLang)) {
        setLanguageState(browserLang);
      }
      
      setLoading(false);
    }

    detectLanguage();
  }, [user]);

  const setLanguage = useCallback(async (newLang: Language) => {
    setLanguageState(newLang);
    localStorage.setItem('preferredLanguage', newLang);

    // Atualizar no banco se usuario autenticado
    if (user?.email) {
      await supabase
        .from('profiles')
        .update({ 
          language: newLang, 
          updated_at: new Date().toISOString() 
        })
        .eq('email', user.email);
    }
  }, [user]);

  return { language, setLanguage, loading };
}
```

---

## Fase 4: Seletor de Idioma na UI

### Componente: `src/components/LanguageSelector.tsx`

```typescript
import { useLanguage } from '@/hooks/useLanguage';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const languages = [
  { code: 'pt', label: 'Portugues', flag: 'BR' },
  { code: 'en', label: 'English', flag: 'US' },
  { code: 'es', label: 'Espanol', flag: 'ES' },
];

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <Select value={language} onValueChange={setLanguage}>
      <SelectTrigger className="w-[120px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map(lang => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

### Adicionar ao Header.tsx

Incluir o `<LanguageSelector />` no cabecalho da aplicacao.

---

## Fase 5: Fluxo de Login Atualizado

### Arquivo: `src/pages/Auth.tsx`

Atualizar para verificar assinatura por EMAIL antes de enviar Magic Link:

```typescript
const handleSendMagicLink = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Verificar se email tem assinatura ativa
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('stripe_customer_id', /* buscar por profile.stripe_customer_id */)
    .in('status', ['active', 'trialing'])
    .single();

  if (!subscription) {
    const messages = {
      pt: 'Nenhuma assinatura ativa. Por favor, assine um plano primeiro.',
      en: 'No active subscription. Please subscribe to a plan first.',
      es: 'No hay suscripcion activa. Por favor, suscribete a un plan primero.',
    };
    toast.error(messages[language]);
    navigate('/planos');
    return;
  }

  // Prosseguir com Magic Link...
};
```

---

## Resumo das Alteracoes por Arquivo

| Arquivo | Alteracao |
|---------|-----------|
| `supabase migration` | Adicionar campo `language` em profiles |
| `stripe-webhook/index.ts` | Remover criacao de usuario, adicionar deteccao de idioma, internacionalizar e-mails |
| `src/hooks/useLanguage.ts` | Novo hook para gerenciar idioma |
| `src/components/LanguageSelector.tsx` | Novo componente seletor |
| `src/components/Header.tsx` | Adicionar LanguageSelector |
| `src/pages/Auth.tsx` | Verificar assinatura por email antes de Magic Link |
| `src/pages/PosPagamento.tsx` | Mensagens traduzidas |
| `src/pages/Sucesso.tsx` | Mensagens traduzidas |

---

## Consideracoes Importantes

### Problema de Transicao

A arquitetura atual vincula `profiles` e `subscriptions` a `user_id`. O prompt sugere vincular por `email`. Isso requer:

1. **Migracao cuidadosa** - manter compatibilidade com usuarios existentes
2. **Logica dupla temporaria** - suportar ambos os modos durante transicao

### Recomendacao

Implementar em **fases graduais**:
1. Primeiro: adicionar campo `language` e internacionalizar e-mails
2. Depois: refatorar gradualmente a vinculacao por email

---

## Checklist de Implementacao

- [ ] Migracao SQL para adicionar campo `language`
- [ ] Atualizar webhook para detectar idioma do metadata
- [ ] Internacionalizar templates de e-mail (welcome, cancellation, paymentFailed)
- [ ] Criar hook `useLanguage`
- [ ] Criar componente `LanguageSelector`
- [ ] Adicionar seletor ao Header
- [ ] Atualizar filtros de conteudo por idioma
- [ ] Traduzir mensagens de erro/sucesso
- [ ] Testar fluxo completo em 3 idiomas
