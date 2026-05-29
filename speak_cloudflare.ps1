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
$synth.Speak('Não, não precisa mudar nada no Cloudflare! O erro que aconteceu nos sites novos da Opção 2 era apenas porque o código do sistema não estava pegando o link final correto que o Vercel gerava. O Cloudflare só gerencia o seu domínio principal, o canva viagem, e como você confirmou que a Opção 1 está funcionando perfeitamente, significa que as suas configurações no Cloudflare estão 100% corretas. O problema era apenas no nosso código mesmo, e já foi consertado!')
