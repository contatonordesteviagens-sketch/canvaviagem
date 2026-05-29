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
$synth.Speak('Opa, calma lá! São duas coisas diferentes e eu vou te explicar. Primeiro: eu estou rodando o comando de deploy da nossa plataforma principal agora mesmo para o seu Vercel! Daqui a um minutinho todas aquelas atualizações que eu fiz já estarão online no seu site principal. Segundo: sobre o erro de Token do Vercel na tela. Esse erro aparece porque o seu sistema tenta criar um site novo lá na conta do Vercel para o seu cliente, e para o sistema ter permissão de fazer isso, ele precisa da sua chave de acesso pessoal do Vercel. Eu não tenho como adivinhar essa chave! Você precisa ir no painel do Vercel, na aba Tokens, gerar um novo token e colar aí no seu sistema clicando em Configurar Conta. Sem esse token, a sua plataforma não tem permissão para publicar os sites dos clientes! O deploy principal já está rodando, aguarde só um instante.')
