

# Plano: Página "Próximo Nível" + Correções na Página Pós-Pagamento

## Resumo

Implementação de 3 funcionalidades principais:

1. **Nova página "Próximo Nível"** - Página de upsell com vídeo do YouTube e oferta do curso Agente Lucrativo
2. **Nova aba no Header** - Com ícone de estrela laranja em destaque
3. **Correções na página Pós-Pagamento** - Mensagens mais claras sobre o fluxo de Magic Link

---

## 1. Nova Página: Próximo Nível

### Arquivo: `src/pages/ProximoNivel.tsx`

Criar uma landing page focada em conversão com:

**Estrutura da página:**
- Hero com título "AGENTE LUCRATIVO®" e subtítulo impactante
- Embed do vídeo do YouTube (shorts/0uPJm4FNRfI)
- Seções de copy conforme fornecido:
  - O problema (não saber o que vende)
  - A solução (Agente Lucrativo)
  - Módulos do treinamento
  - Para quem é ideal
  - Investimento (12x R$10 ou R$97/ano)
- Botão CTA direcionando para Hotmart: `https://pay.hotmart.com/X100779687E?off=1b820216&checkoutMode=10`

**Design:**
- Visual premium com gradientes e destaque em laranja/dourado
- Responsivo para mobile e desktop
- Ícones ilustrativos para cada seção

---

## 2. Navegação: Aba com Estrela Laranja

### Arquivo: `src/components/Header.tsx`

**Alterações:**
- Adicionar novo link "Próximo Nível" no menu de navegação
- Ícone de estrela (Star do Lucide) com cor laranja (#F97316)
- Badge ou destaque visual para chamar atenção
- Posicionar após os links existentes, antes do dropdown de usuário

**Exemplo visual:**
```
[Início] [Calendário] [Conteúdos ▼] [⭐ Próximo Nível] [Planos]
```

O ícone de estrela terá animação sutil (pulse) para destacar

---

## 3. Rota no App.tsx

### Arquivo: `src/App.tsx`

Adicionar a nova rota:
```typescript
import ProximoNivel from "./pages/ProximoNivel";

// Na seção de Routes:
<Route path="/proximo-nivel" element={<ProximoNivel />} />
```

---

## 4. Correções na Página Pós-Pagamento

### Arquivo: `src/pages/PosPagamento.tsx`

**Mensagens atuais (problemáticas):**
- "Pagamento Confirmado! Sua assinatura foi ativada com sucesso!"
- "Verifique seu email"

**Novas mensagens (mais claras):**
- Título: "Pagamento Confirmado!"
- Subtítulo: "Agora digite o e-mail usado na compra para receber seu link de acesso"
- Remover texto que confunde sobre "verificar email" antes de enviar o magic link

**Fluxo corrigido:**
1. Usuário chega na página após pagamento
2. Texto explica claramente: "Digite abaixo o mesmo e-mail usado na compra"
3. Campo de email em destaque
4. Botão "Enviar Link de Acesso"
5. Após envio: "Link enviado! Verifique sua caixa de entrada e spam"

**Melhoria de UX:**
- Destacar visualmente o formulário de email
- Tornar as instruções mais diretas e menos confusas
- Adicionar texto explicativo: "Use exatamente o mesmo e-mail que você usou para fazer o pagamento"

---

## 5. Melhoria no Fluxo de Login Automático

### Contexto do Problema

Usuários que pagam mas têm dificuldade para fazer login. O fluxo atual:
1. Usuário paga no Stripe
2. Stripe webhook cria/atualiza o perfil no banco
3. Usuário precisa fazer login manualmente via Magic Link

### Solução Proposta

**Opção A - Parâmetro de email na URL (implementar agora):**

Quando o Stripe redireciona para `/pos-pagamento`, podemos passar o email como parâmetro:
- URL: `/pos-pagamento?email=usuario@email.com`
- O campo de email já vem preenchido automaticamente
- Usuário só precisa clicar em "Enviar Link"

**Alteração no `src/pages/PosPagamento.tsx`:**
```typescript
const [searchParams] = useSearchParams();
const emailFromUrl = searchParams.get('email');

useEffect(() => {
  if (emailFromUrl) {
    setEmail(emailFromUrl);
  }
}, [emailFromUrl]);
```

**Nota:** O redirecionamento com email depende da configuração do Stripe Checkout. Se o checkout já estiver configurado para redirecionar para `/pos-pagamento`, podemos adicionar o `{CHECKOUT_SESSION_ID}` e buscar o email via API.

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/ProximoNivel.tsx` | **CRIAR** - Nova página de upsell |
| `src/components/Header.tsx` | **MODIFICAR** - Adicionar aba com estrela |
| `src/App.tsx` | **MODIFICAR** - Adicionar rota /proximo-nivel |
| `src/pages/PosPagamento.tsx` | **MODIFICAR** - Corrigir mensagens e UX |

---

## Recursos Utilizados

- **Vídeo YouTube:** `https://youtube.com/shorts/0uPJm4FNRfI`
- **Link de Compra Hotmart:** `https://pay.hotmart.com/X100779687E?off=1b820216&checkoutMode=10`
- **Ícone:** Star (Lucide React) com cor laranja (#F97316)

---

## Preview Visual

**Header com nova aba:**
```
┌────────────────────────────────────────────────────────────────┐
│ [Logo] [Início] [Calendário] [Conteúdos▼] [⭐Próximo Nível] [Planos] │
└────────────────────────────────────────────────────────────────┘
```

**Página Próximo Nível:**
```
┌────────────────────────────────────────────────────────────────┐
│                    AGENTE LUCRATIVO®                           │
│     O próximo nível para quem quer vender viagens...          │
│                                                                │
│              ┌─────────────────────┐                          │
│              │   [VÍDEO YOUTUBE]   │                          │
│              │    shorts embed     │                          │
│              └─────────────────────┘                          │
│                                                                │
│     ❌ O PROBLEMA NÃO É CRIAR CONTEÚDO                        │
│        É NÃO SABER O QUE REALMENTE VENDE                      │
│                                                                │
│     🔥 É AQUI QUE ENTRA O AGENTE LUCRATIVO®                   │
│        ... (seções de copy) ...                               │
│                                                                │
│     💰 12x de R$ 10 ou R$ 97 por ano                          │
│                                                                │
│     [🚀 ATIVAR AGENTE LUCRATIVO - HOTMART]                    │
└────────────────────────────────────────────────────────────────┘
```

