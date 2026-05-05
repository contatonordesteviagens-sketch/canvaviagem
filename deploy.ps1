# Script de Deploy Canva Viagem
# Este script automatiza o commit e push para o GitHub, disparando o deploy no Lovable.

Write-Host "Iniciando Deploy Canva Viagem..."

# 1. Adicionar arquivos
git add src/lib/fabrica-compose-art.ts
git add src/pages/fabrica/Phase3ArtFactory.tsx
git add maintenance/MASTER_README.md

# 2. Commit com mensagem descritiva
$message = "feat: legendas/copy automaticas baseadas nos dados do anuncio + blindagem motor v2"
git commit -m $message

# 3. Push para o GitHub (Dispara Deploy no Lovable)
Write-Host "Enviando para GitHub..."
git push origin main --force

Write-Host "Deploy Concluido! Verifique em canvaviagem.com/fabrica"
