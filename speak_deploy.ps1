Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer

try {
    $synth.SelectVoice('Microsoft Daniel')
} catch {
    try {
        $synth.SelectVoiceByHints('Male', 'NotSet', 0, 'pt-BR')
    } catch {}
}

$synth.Rate = 5
$synth.Speak('Aviso recebido! Já tinha enviado para o GitHub, mas acabei de disparar o deploy manual direto no Vercel também para garantir que a atualização entre no ar imediatamente. Pode acompanhar que em alguns segundos a plataforma já vai estar com o código 100% atualizado para os clientes!')
