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
$synth.Speak('Pronto! O problema do Vercel foi resolvido e já está no GitHub. A falha acontecia porque o Vercel gera um link aleatório quando o nome já existe, mas o nosso sistema forçava o nome antigo e mandava o cliente para um link quebrado. Agora o código captura o link real que o Vercel devolver! Pode testar!')
