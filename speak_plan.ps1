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
$synth.Speak('A ideia é sensacional! Eu acabei de criar o plano oficial de implementação. O funcionamento será através do Gemini, que tem a vantagem de processar um milhão de tokens de uma só vez e lê PDFs e imagens nativamente. Para economizar tokens nos sites, nós vamos extrair apenas o texto puro da página web. Já para imagens e PDFs grandes, podemos reduzir a qualidade antes do envio e os custos serão de frações de centavo por leitura. O sistema vai extrair o nome da empresa, os destinos, e empacotar todos os produtos com descrição e preço diretamente na Fase 2 da plataforma, populando tudo automaticamente. Você só precisa me responder duas coisas que estão no plano: primeiro, você quer que esse extrator seja uma Fase Zero antes de tudo, ou um botão mágico dentro da Fase 1? Segundo, você quer que a inteligência tente sugerir capas para os pacotes ou só traga os textos? Se aprovar a ideia geral, é só me dar o ok e eu começo a construir!')
