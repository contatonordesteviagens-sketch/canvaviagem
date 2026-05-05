# Script de Deploy Canva Viagem
# Este script automatiza o commit e push para o GitHub, disparando o deploy no Lovable.

Write-Host "Iniciando Deploy Canva Viagem..."

# 1. Adicionar arquivos de código-fonte relevantes
git add src/lib/fabrica-compose-art.ts
git add src/pages/fabrica/Phase3ArtFactory.tsx
git add src/pages/fabrica/Phase4LandingBuilder.tsx
git add src/pages/fabrica/Phase1Diagnostico.tsx
git add src/pages/fabrica/Phase2Ativos.tsx
git add src/pages/Fabrica.tsx
git add src/hooks/useFabricaContext.tsx
git add maintenance/MASTER_README.md
git add maintenance/PROMPT_AGENTE_MANUTENCAO.md

# 2. Commit com mensagem descritiva e timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
$message = "fix: correcao visual + icones maiores V3/V4 + encoding labels [$timestamp]"
git commit -m $message

# 3. Push para o GitHub (Dispara Deploy no Lovable)
Write-Host "Enviando para GitHub..."
git push origin main --force

Write-Host "Deploy Concluido! Verifique em canvaviagem.com/fabrica"
