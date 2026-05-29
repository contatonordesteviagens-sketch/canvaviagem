Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer

try {
    $synth.SelectVoice('Microsoft Daniel')
} catch {
    try {
        $synth.SelectVoiceByHints('Male', 'NotSet', 0, 'pt-BR')
    } catch {}
}

$synth.Rate = 1
$synth.Speak('Desculpe, eu tinha acelerado a voz como você pediu antes. Vou perguntar mais devagar agora. Eu preciso que você me responda apenas duas coisas simples sobre o Extrator de Inteligência Artificial: Primeira pergunta: Onde você quer que esse botão fique? Deve ser a primeira tela de todas antes de começar a montar o site, ou deve ser um botão mágico dentro da Fase 1, junto com os botões de cor e nome que já existem lá? Segunda pergunta: Quando a IA ler o PDF ou site do cliente, você quer que ela traga apenas os textos dos pacotes, como preço e descrição, ou você quer que ela também tente baixar e importar as imagens que encontrar no PDF para usar de capa nos pacotes? Me responda essas duas coisas e eu começo a fazer o código imediatamente!')
