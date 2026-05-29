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
$synth.Speak('Atenção! Entenda exatamente o que está acontecendo. Eu terminei todas as alterações que você pediu e enviei tudo para o GitHub do seu projeto. O motivo de você não ver as alterações no seu site, é porque você precisa ir no painel do Lovable e clicar em "Puxar do GitHub" ou "Sync with GitHub" para que o Lovable atualize a versão que você está testando! Se você não atualizar lá, as minhas edições nunca vão aparecer pra você. Sobre o Vercel: você reclamou que ele sumiu. O que aconteceu foi que eu tinha trocado as instruções velhas manuais pelo botão de um clique, mas como você não configurou o Token, o botão dá erro. Acabei de restaurar todas as instruções manuais antigas do Vercel exatamente como eram antes. Vá no Lovable, sincronize o projeto, e a opção antiga de arrastar e soltar do Vercel vai estar lá novamente, além do projeto não selecionado aparecer vazio na Fábrica. Por favor, sincronize o Lovable agora!')
