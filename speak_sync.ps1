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
$synth.Speak('Pela sua foto eu vi exatamente o que está acontecendo! Você provavelmente está olhando a pré-visualização do Lovable ou o site que já estava aberto. O código novo está a salvo lá no GitHub, mas a tela do Lovable não atualiza sozinha. Para a caixa nova aparecer aí na sua tela, você precisa ir na interface do Lovable, clicar no ícone do GitHub que fica lá em cima, e clicar no botão escrito Pull from GitHub, ou Sincronizar. Depois que você clicar nisso, o Lovable vai puxar o código do Extrator que eu fiz e a caixa vai brotar magicamente na sua tela! Tenta lá!')
