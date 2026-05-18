# 🚀 Guia Completo: GitHub + Deploy no Lovable

> Projeto: **CANVA_VIAGEM_ESTAVEL_24_ABRIL**
> Pasta local: `C:\Users\win 10\Desktop\CANVA_VIAGEM_ESTAVEL_24_ABRIL`
> Repositório GitHub: `https://github.com/contatonordesteviagens-sketch/canvaviagem-6647054a`

---

## PARTE 1 — Conectar ao GitHub

### Passo 1 — Instalar o Git (se ainda não tiver)

Abra o PowerShell e verifique:
```powershell
git --version
```
Se aparecer `git version X.X.X` → já está instalado. Caso contrário, baixe em: https://git-scm.com/download/win

---

### Passo 2 — Configurar seu nome e e-mail no Git

```powershell
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

> Use o mesmo e-mail da sua conta do GitHub.

---

### Passo 3 — Autenticar no GitHub (token pessoal)

O GitHub não aceita mais senha. Você precisa de um **Personal Access Token**:

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token (classic)"**
3. Marque os escopos: ✅ `repo` (todos os subitens)
4. Clique em **Generate token**
5. **Copie o token** (ele aparece só uma vez!)

Quando o Git pedir sua senha no terminal, **cole o token** no lugar da senha.

> **Dica:** Para não precisar digitar toda vez, rode:
> ```powershell
> git config --global credential.helper store
> ```
> Na primeira vez que autenticar, ele salva automaticamente.

---

### Passo 4 — Verificar o repositório conectado

```powershell
git remote -v
```

**Este projeto já está conectado a:**
```
origin  https://github.com/contatonordesteviagens-sketch/canvaviagem-6647054a.git
```

---

## PARTE 2 — Deploy contínuo (Push do dia a dia)

Para enviar atualizações basta:

```powershell
cd "C:\Users\win 10\Desktop\CANVA_VIAGEM_ESTAVEL_24_ABRIL"

git add .
git commit -m "descricao das mudancas"
git push origin main
```

---

## PARTE 3 — Conectar ao Lovable e fazer Deploy

### O que é o Lovable?
O Lovable é a plataforma que hospeda e publica seu projeto automaticamente a cada push no GitHub.

---

### Passo 1 — Acessar o Lovable

1. Acesse: https://lovable.dev
2. Faça login com sua conta (pode usar o Google)

---

### Passo 2 — Conectar seu repositório GitHub

1. No painel do Lovable, clique em **"Import from GitHub"** ou **"New Project"**
2. Autorize o Lovable a acessar sua conta do GitHub (se for a primeira vez)
3. Selecione o repositório `canvaviagem-6647054a`
4. Aguarde o Lovable detectar as configurações do projeto (ele lê o `package.json`)

---

### Passo 3 — Configurar o build (se necessário)

O Lovable geralmente detecta automaticamente. Se pedir configuração manual:

| Campo | Valor |
|-------|-------|
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |
| **Node Version** | `18` ou `20` |

---

### Passo 4 — Deploy automático

- Após conectar, **cada push no GitHub** dispara um deploy automático no Lovable.
- O site fica disponível numa URL como: `https://canvaviagem-6647054a.lovable.app`

---

### Passo 5 — Deploy manual (forçar publicação)

Se quiser forçar um novo deploy sem fazer mudanças no código:

```powershell
# Faz um commit vazio só pra triggerar o deploy
git commit --allow-empty -m "chore: trigger deploy"
git push origin main
```

Ou pelo painel do Lovable, clique em **"Redeploy"**.

---

## RESUMO RÁPIDO — Fluxo do dia a dia

```powershell
# 1. Entrar na pasta do projeto
cd "C:\Users\win 10\Desktop\CANVA_VIAGEM_ESTAVEL_24_ABRIL"

# 2. Verificar o que mudou
git status

# 3. Adicionar tudo
git add .

# 4. Commitar com descrição
git commit -m "feat: descricao do que foi feito"

# 5. Enviar pro GitHub (isso já dispara o deploy no Lovable)
git push origin main
```

---

## 🔧 Comandos úteis extras

```powershell
# Ver histórico de commits
git log --oneline -10

# Ver o que mudou antes de commitar
git diff

# Ver em qual branch você está
git branch

# Ver o repositório conectado
git remote -v
```

---

## ⚠️ Problemas comuns

| Problema | Solução |
|----------|---------|
| `remote: Permission denied` | Token inválido ou expirado → gere um novo |
| `error: failed to push some refs` | Faça `git pull origin main` primeiro |
| `nothing to commit` | Não houve mudança nos arquivos |
| Build falhou no Lovable | Rode `npm run build` local primeiro e corrija os erros |
