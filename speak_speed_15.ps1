Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer

try {
    $synth.SelectVoice('Microsoft Daniel')
} catch {
    try {
        $synth.SelectVoiceByHints('Male', 'NotSet', 0, 'pt-BR')
    } catch {}
}

$synth.Rate = 3
$synth.Speak('Entendido! Ajustei a velocidade para um e meio. Para eu poder começar a programar a Inteligência Artificial agora mesmo, por favor me responda: Um, quer que o Extrator fique na Fase Zero antes de tudo ou como um botão mágico dentro da Fase 1? E dois, quer que a IA apenas traga os textos de preço e descrição, ou que ela também tente extrair as fotos do PDF do cliente para usar de capa nos pacotes? Estou no aguardo da sua resposta para começar!')
