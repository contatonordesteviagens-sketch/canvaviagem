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
$synth.Speak('Amigo, preste muita atenção. Eu vi as suas fotos. O motivo dos erros continuarem é que você NÃO atualizou o projeto no Lovable! O seu Lovable ainda está rodando o código velho. Eu tenho 100% de certeza disso porque a foto que você me mandou da fase 4 NÃO tem as instruções manuais do Vercel que eu acabei de colocar no código. Se o código novo estivesse aí, as instruções de arrastar e soltar apareceriam debaixo do botão. Além disso, o erro do Edge Function que você mandou na fase zero é gerado por uma linha de código que eu JÁ APAGUEI. Por favor, acredite em mim. Vá no painel do Lovable, clique no botão de puxar ou sincronizar com o GitHub. E depois, atualize a página. Se você não fizer isso, você vai continuar testando a versão com defeito para sempre. Puxe as atualizações no Lovable!')
