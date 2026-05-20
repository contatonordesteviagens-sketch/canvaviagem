Add-Type -AssemblyName System.speech
$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speak.Rate = 3  # Velocidade acelerada equivalente a 1.7x

# Procura uma voz em português disponível. Se achar 'Microsoft Daniel' ou 'Microsoft Maria', seleciona.
$voices = $speak.GetInstalledVoices()
$ptVoice = $voices | Where-Object { $_.VoiceInfo.Culture.Name -like "pt-*" } | Select-Object -First 1

if ($ptVoice) {
    $speak.SelectVoice($ptVoice.VoiceInfo.Name)
} else {
    try {
        $speak.SelectVoice('Microsoft Daniel')
    } catch {}
}

$texto = @"
Relatório de Otimizações Concluídas com Sucesso!

Primeiro ponto. Quebra da Ilusão do Ao Vivo.
O chat de comentários falsos, a curva de visualizações e o temporizador de vagas escassas agora param no exato milissegundo em que o vídeo for pausado. O progresso e a experiência de simulação ao vivo estão completamente integrados.

Segundo ponto. Otimização Econômica do Supabase.
O banco de dados não receberá mais o bombardeio de batimentos cardíacos a cada dez segundos. Agora, o tempo assistido e o progresso da sessão são guardados localmente no navegador, de graça. A gravação no Supabase só ocorre em momentos cruciais: a cada três minutos, ao clicar no botão de compra, ao enviar um comentário, ao pausar o vídeo ou ao fechar a aba do navegador. Isso reduz as transações e o custo do banco a quase zero.

Terceiro ponto. Número Único de Suporte.
O número de WhatsApp de suporte foi atualizado de forma definitiva para o número solicitado: oitenta e cinco, nove, nove, oito, quatro, cinco, oitenta e nove, noventa e cinco. Ele já está ativo em todos os botões de contato, modais de pagamento e links dinâmicos do projeto.

O build de produção compilou com sucesso em dezenove segundos e o deploy final foi enviado de forma forçada para as ramificações main e master. Tudo pronto e no ar!
"@

$speak.Speak($texto)
