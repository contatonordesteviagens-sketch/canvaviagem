
# Plano: Atualizar GIF e Vídeos do YouTube na Página ES/Planos

## Resumo

Atualizar a página de planos em espanhol (`/es/planos`) com:
1. **Primeiro GIF** substituído por novo URL
2. **4 vídeos do YouTube** substituídos por novos YouTube Shorts

---

## Arquivos a Serem Modificados

### src/pages/PlanosES.tsx

#### 1. Atualizar primeiro GIF (Linha 26)

| Posição | De | Para |
|---------|-----|------|
| 1º GIF | `https://media.giphy.com/media/cA9Hq7AaawDVrbP4pn/giphy.gif` | `https://media.giphy.com/media/OEXnFVFMGCAoIuvcfs/giphy.gif` |

**Código atualizado:**
```typescript
const proofGifs = [
  "https://media.giphy.com/media/OEXnFVFMGCAoIuvcfs/giphy.gif", // ← ATUALIZADO
  "https://media.giphy.com/media/cA9Hq7AaawDVrbP4pn/giphy.gif",
  // ... resto permanece igual
];
```

---

#### 2. Atualizar vídeos do YouTube (Linhas 34-39)

Os YouTube Shorts usam IDs curtos. Extraindo os IDs das URLs fornecidas:

| URL Fornecida | ID Extraído |
|--------------|-------------|
| `https://youtube.com/shorts/WQHy13ySG-g` | `WQHy13ySG-g` |
| `https://youtube.com/shorts/NYkxwcI2Cr0` | `NYkxwcI2Cr0` |
| `https://youtube.com/shorts/QYjziquV-YU` | `QYjziquV-YU` |
| `https://youtube.com/shorts/VmX1raYC96E` | `VmX1raYC96E` |

**Código atualizado:**
```typescript
const youtubeVideos = [
  { id: "WQHy13ySG-g", title: "Video 1" },
  { id: "NYkxwcI2Cr0", title: "Video 2" },
  { id: "QYjziquV-YU", title: "Video 3" },
  { id: "VmX1raYC96E", title: "Video 4" },
];
```

---

## Resumo Visual

```text
┌─────────────────────────────────────────────────────────────┐
│                    MUDANÇAS                                  │
├─────────────────────────────────────────────────────────────┤
│ GIFS (proofGifs):                                           │
│   • 1º: cA9Hq7... → OEXnFVF...                              │
│   • 2º-6º: SEM ALTERAÇÃO                                    │
├─────────────────────────────────────────────────────────────┤
│ YOUTUBE (youtubeVideos):                                    │
│   • dvInvZZ7fLY → WQHy13ySG-g                               │
│   • vUgCtB-yUPg → NYkxwcI2Cr0                               │
│   • KsGg1kWgFjA → QYjziquV-YU                               │
│   • QcwzHP3Y3Nc → VmX1raYC96E                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Arquivo Afetado

- `src/pages/PlanosES.tsx` (2 blocos de código modificados, ~10 linhas)
