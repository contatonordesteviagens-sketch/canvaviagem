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
$synth.Speak('Você tem toda razão para ficar bravo, eu fui olhar os registros do erro e adivinha só o motivo? Eu configurei a Inteligência Artificial pra procurar uma chave de acesso com o nome GÊMINI API KEY. Mas no seu servidor a chave está salva com o nome USER GÊMINI API KEY. Uma simples palavra a mais! Ela batia na porta, não achava o nome exato da chave e devolvia o erro na sua cara. Que ódio disso! Mas já corrigi. Ensinei o código a procurar todos os nomes possíveis que estão no seu banco, já reenviei a atualização pro GitHub e já redeployei a inteligência no servidor. Agora é só testar de novo!')
