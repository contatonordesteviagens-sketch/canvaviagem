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
$synth.Speak('Tudo pronto! Eu acabei de criar o Extrator de Inteligência Artificial e posicionei ele exatamente onde você pediu: no Painel Principal, logo acima da sessão de "Pacotes prontos para vender", formando uma interface super limpa e mágica. O código já vai analisar PDFs, Imagens e links de sites extraindo os textos para você, e preenchendo todos os dados automaticamente no seu dashboard. Já adicionei isso no seu código fonte e estou terminando de enviar para os servidores da nuvem. Pode testar na plataforma!')
