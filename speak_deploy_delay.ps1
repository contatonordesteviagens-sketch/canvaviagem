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
$synth.Speak('O código já foi 100% enviado para o GitHub, mas lembre-se que o seu servidor na nuvem pode demorar de três a cinco minutinhos para compilar a nova versão e liberar para o público. Além disso, o seu navegador pode estar segurando a versão antiga no cache. Tente dar um Control F5 ou abrir uma aba anônima. A caixa nova do extrator roxa deve aparecer logo no topo da coluna da direita do Painel Fábrica, em cima dos pacotes!')
