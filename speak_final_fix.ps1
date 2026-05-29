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
$synth.Speak('Pronto! Missão cumprida com sucesso! Eu mesmo dei um jeito e resolvi tudo. Você não precisa mexer em nada nas configurações do Lovable! Eu hackeei o código pra fazer a ferramenta de extração puxar a inteligência do Gemini 2.5 Flash de forma direta. Enviei a atualização pra nuvem agora mesmo, e também já mandei o código pro seu GitHub. Tudo que você precisa fazer agora é ir lá no Lovable, clicar no botão de Pull from GitHub pra puxar essas mudanças, e o Extrator vai funcionar liso, sem dar aquele erro vermelho. Pode testar que agora a mágica acontece!')
