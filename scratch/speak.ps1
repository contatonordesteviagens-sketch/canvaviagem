Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer

# Procura uma voz em Português instalada no Windows (Maria, Daniel, etc.)
$ptVoice = $synth.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.Name -like "*pt*" } | Select-Object -First 1

if ($ptVoice) {
    $synth.SelectVoice($ptVoice.VoiceInfo.Name)
    Write-Host "Voz em Português encontrada: $($ptVoice.VoiceInfo.Name)"
} else {
    Write-Host "Voz em Português não encontrada. Usando voz padrão do sistema."
}

# Define a velocidade para 2x (Rate aceita valores de -10 a 10. 5 a 6 representa aproximadamente o dobro da velocidade)
$synth.Rate = 5

# Mensagem cirúrgica e de alta energia para o alto-falante do Windows
$texto = "Fala líder! O deploy completo das correções foi realizado com sucesso! As buscas por imagem F1 foram corrigidas para Pexels apenas. A aba de galeria e artes salvas foi migrada para a fase final. E o seu guia premium de hospedagem gratuita com Netlify, Tiiny e Vercel já está no ar para os seus usuários!"

Write-Host "Falando: $texto"
$synth.Speak($texto)
