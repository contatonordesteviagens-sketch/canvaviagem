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
$synth.Speak('O deploy já foi concluído com sucesso e já está disponível para testes! Sobre os custos, trago notícias maravilhosas. Nós escolhemos o Gemini 1 ponto 5 Flash exatamente porque ele é um dos mais potentes e absurdamente baratos do mercado. Primeiro: se você estiver usando a chave gratuita do Google, você tem até mil e quinhentas consultas de graça por dia. Mas se for pagar, os valores em reais são ridículos de baixos. Extrair um site inteiro custa cerca de zero vírgula um centavo de real. Ler um PDF de dez páginas custa zero vírgula dois centavos. E ler uma imagem custa zero vírgula zero um centavo! Ou seja, mesmo que mil clientes usem essa ferramenta intensamente no mês, você provavelmente gastaria menos de cinco reais no total! É praticamente de graça pelo valor absurdo que entrega. Pode testar sem medo!')
