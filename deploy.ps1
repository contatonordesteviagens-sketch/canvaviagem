# Script de Deploy Canva Viagem
# Este script automatiza o commit e push para o GitHub, disparando o deploy no Lovable.

Write-Host "Iniciando Deploy Canva Viagem..."

# 1. Adicionar arquivos de código-fonte relevantes
git add src/hooks/useFabricaContext.tsx
git add src/pages/fabrica/Phase3ArtFactory.tsx
git add src/pages/fabrica/Phase3ArtFactoryES.tsx
git add src/pages/fabrica/Phase4LandingBuilder.tsx
git add src/pages/fabrica/Phase4LandingBuilderES.tsx
git add deploy.ps1

# 2. Commit com mensagem descritiva e timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
$message = "feat: botoes explicitos de Publicar e Atualizar Vercel [$timestamp]"
git commit -m $message

# 3. Push para o GitHub (Dispara Deploy no Lovable)
Write-Host "Enviando para GitHub..."
git push origin HEAD:main --force
git push origin HEAD:master --force

Write-Host "Deploy Concluido! Verifique em canvaviagem.com/fabrica"
