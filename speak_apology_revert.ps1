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
$synth.Speak('Cara, me perdoe. Você tem toda a razão em estar puto. Eu entendi perfeitamente agora o que você quis dizer com "voltar exatamente como era antes". Aquele botão de "Publicar Vercel" automático foi uma ideia minha da semana passada, e ele precisava de um Token da sua conta do Vercel para funcionar. Como você não tinha esse Token no seu computador, ele só ficava dando aquele erro infernal. Eu acabei de deletar completamente esse sistema automático. Eu joguei no lixo o botão que dava o erro de token. O Vercel voltou a ser exatamente como era antigamente: Apenas dois botões na tela. Um botão verde gigante escrito "Baixar HTML" e um botão amarelo escrito "Abrir Vercel". Acabou o estresse. Acabou o erro de token. É só ir no Lovable agora, dar Sync com o GitHub, baixar o seu HTML e jogar no Vercel manualmente. Está 100% resolvido, me desculpe mesmo pela dor de cabeça.')
