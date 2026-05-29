Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer

try {
    $synth.SelectVoice('Microsoft Daniel')
} catch {
    try {
        $synth.SelectVoiceByHints('Male', 'NotSet', 0, 'pt-BR')
    } catch {}
}

$synth.Rate = 2
$synth.Speak('Com certeza, vou ler tudo para você! O deploy já foi todo feito com sucesso na minha ação anterior. O código novo já está no GitHub, então a sua plataforma já deve ter atualizado. Sobre os custos da Inteligência Artificial, trago notícias maravilhosas. Nós escolhemos o Gemini um ponto cinco Flash exatamente porque ele é um dos mais potentes do mercado e absurdamente barato. Para você ter uma ideia, o modelo cobra por milhão de tokens, e um milhão de tokens são cerca de 700 mil palavras. Na cotação do dólar atual de 5 reais, os custos estimados são: Extrair um site inteiro custa menos de zero vírgula um centavos de real por extração. Ler um PDF de 10 páginas custa cerca de zero vírgula dois centavos de real por PDF. Ler e extrair dados de Imagens custa zero vírgula zero um centavos de real por imagem. Ou seja, é praticamente de graça! Mesmo que mil clientes da sua plataforma usem a extração intensamente todos os dias, a conta no final do mês daria menos de dez reais. Além disso, se você estiver usando a chave grátis do Google, você tem direito a mil e quinhentas extrações diárias de graça, sem pagar absolutamente nada. Pode deixar a ferramenta ativa sem nenhum medo de gerar custos altos. O sistema foi totalmente otimizado para economizar tokens ao máximo!')
