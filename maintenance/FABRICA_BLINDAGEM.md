# 🛡️ FABRICA BLINDAGEM — SISTEMA NÍVEL 4

## Commit: `fc98959` — DEPLOY ATIVO

---

## ERROS CORRIGIDOS NESTA SESSÃO (2026-05-05)

### 🔴 ERRO 1 — `curSym` declarado duplicado
**Build crashava com:** `The symbol "curSym" has already been declared`
**Causa:** Bloco de blindagem NÍVEL 3 foi inserido após a declaração da variável, gerando duplicata.
**Fix:** Removida a segunda declaração `const curSym = currencySymbol || "R$"` (mantida apenas a versão `.trim()`).

### 🔴 ERRO 2 — `export` inesperado (linha 2576)
**Build crashava com:** `Unexpected "export" at reframeImageToAspect`
**Causa:** `if (variant === 4) {` dentro de `renderSafeSquareOffer` nunca foi fechado — faltavam 2 `}`.
**Fix:** 
1. Inserido `}` para fechar o bloco `if (variant === 4)` após o trecho `showPixBanner`
2. Inserido `}` para fechar a função `composeTravelAd` corretamente antes de `reframeImageToAspect`

### 🔴 ERRO 3 — "Sua Agência" em todos os designs
**Problema:** Rodapé exibia "SUA AGÊNCIA" mesmo sem logo ou nome configurado.
**Fix:** Alterado o `else` para `else if (agencyName && agencyName.trim())` — sem nome de agência, o bloco wordmark não renderiza NADA.

---

## SISTEMA DE BLINDAGEM ATIVO

### Regra 1 — SEGURANÇA INSTAGRAM
```
Zona de exclusão: 480px no rodapé de Stories
Nenhum elemento dinâmico entra nessa área
```

### Regra 2 — SEPARAÇÃO CATEGÓRICA
```
isExperience === true → price = "" e installments = ""
Preço NUNCA vaza para designs de Experiência
```

### Regra 3 — HIGIENIZAÇÃO DE ESTADO
```
showTotal e showPixBanner forçados para false em Experiência
Nenhum dado de oferta contamina categorias de luxo
```

### Regra 4 — BRANDING CONDICIONAL ⭐ NOVO
```
logoUrl + contactsToDraw.length === 0 → return (sem rodapé)
agencyName vazio → else if NÃO executa (sem "Sua Agência")
Resultado: se usuário não configurou NADA, o rodapé não existe
```

---

## VARIANTES ATIVAS (V0-V4)

| Variant | Categoria | Feed | Story | Blindagem |
|---------|-----------|------|-------|-----------|
| V0 | 2/1/1 | ✅ | ✅ | ✅ |
| V1 | 2/2/2 | ✅ | ✅ | ✅ |
| V2 | 2/1/2 | ✅ | ✅ | ✅ |
| V3 | 2/2/1 | ✅ | ✅ | ✅ |
| V4 | Premium | ✅ | ✅ | ✅ CORRIGIDO |

---

## COMO DETECTAR NOVOS ERROS DE BUILD

Se build falhar novamente com erros de brace:
```powershell
# Contar profundidade de braces no arquivo
$lines = Get-Content "src/lib/fabrica-compose-art.ts" -Encoding UTF8
$depth = 0
foreach ($line in $lines) {
    foreach ($ch in $line.ToCharArray()) {
        if ($ch -eq '{') { $depth++ }
        elseif ($ch -eq '}') { $depth-- }
    }
}
Write-Host "Depth final (deve ser 0): $depth"
```

Se depth != 0, há brace desbalanceado. Corrigir antes do push.
