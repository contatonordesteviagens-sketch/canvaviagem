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
$synth.Speak('Aí, finalmente o Lovable colaborou e a tela apareceu exatamente no lugar! Ponto pra gente! Sobre esse erro que deu agora ao clicar no botão: a culpa foi 100% minha. Como a gente estava brigando com o Lovable, eu literalmente construí o cérebro da Inteligência Artificial na sua máquina e esqueci de apertar o botão de ligar ela no servidor do banco de dados. Mas eu já liguei! Pode apertar o botão de extrair aí na sua tela de novo que agora a mágica vai acontecer de verdade!')
