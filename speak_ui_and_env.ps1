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
$synth.Speak('Resolvido! Eu acabei de mover a caixinha de Projetos Salvos lá para o topo do Painel Inicial da Fábrica, antes do F1, exatamente como você pediu. Quando selecionar nenhum, fica vazio, e quando escolher, puxa os dados. Já mandei pro GitHub, é só você dar Pull no Lovable. Agora, escuta com atenção sobre o erro da função: eu descobri que o seu Lovable ainda está apontando para o banco de dados antigo do modelo! O seu banco de dados novo se chama mgdsj... mas no Lovable, as variáveis de ambiente ainda estão apontando para o banco antigo zdjtcw... É por isso que dá erro! Você precisa ir nas configurações do Lovable, na aba Secrets ou Environment Variables, e atualizar o link do Supabase pro seu banco de dados novo. A função já está instalada no banco novo, o Lovable só precisa saber qual é o certo!')
