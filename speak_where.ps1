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
$synth.Speak('Eu adicionei o extrator de Inteligência Artificial dentro da Fábrica de Destinos, na aba principal chamada Painel Inicial. Sabe quando você abre a Fábrica e tem a coluna da direita com a sessão "Seus Pacotes", onde fica a lista de pacotes prontos para vender? Eu coloquei ele exatamente ali, no topo dessa coluna, bem em cima da lista de pacotes, como você tinha pedido na primeira vez. Dá uma olhadinha no "Painel Inicial" da Fábrica!')
