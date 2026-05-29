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
$synth.Speak('Amigo, preste atenção. Essa mensagem de erro do Vercel Token só aparece quando você clica no botão "Publicar Vercel". Você não pode clicar nesse botão porque você não tem o token! A opção manual que eu recoloquei para você não é um botão, é um texto que diz "Ou publique manualmente grátis e sem tokens", e ela está logo abaixo desse botão. Ela ensina você a descer a página até o final, clicar no botão "Baixar HTML" e depois arrastar a pasta para o Vercel, exatamente como você fazia antes! Se o texto de instruções manuais ainda não apareceu debaixo do botão, é porque o seu Vercel ainda não terminou de publicar a minha correção. Por favor, leia as instruções debaixo do botão em vez de clicar no botão que exige o token.')
