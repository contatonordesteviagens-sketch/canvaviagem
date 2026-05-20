Add-Type -AssemblyName System.speech
$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speak.Rate = 1

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
Olá! Aqui está a análise crítica e cética sobre a live e o painel administrativo.

Primeiro ponto. A quebra da ilusão do ao vivo.
Atualmente, se o usuário pausa o vídeo da transmissão, o chat falso e os contadores de escassez continuam rolando normalmente no fundo. O cérebro do lead percebe imediatamente que não é uma transmissão real. Se está pausado para mim, como as outras pessoas continuam comentando em tempo real? A solução é pausar a renderização do chat e o cronômetro de escassez imediatamente quando o vídeo for pausado.

Segundo ponto. Gargalo no WhatsApp de vendas.
Hoje, todos os leads quentes que clicam no suporte ou na oferta são direcionados apenas para o número do Lucas. Sob tráfego pesado de campanhas, o WhatsApp do Lucas vai travar, haverá atrasos nas respostas e vendas serão perdidas. A solução é implementar uma distribuição rotativa, dividindo os cliques entre múltiplos atendentes cadastrados no painel.

Terceiro ponto. Sobrecarga e custos no Supabase.
O sistema envia batimentos cardíacos de progresso a cada dez segundos por usuário ativo. Sob tráfego de mil usuários simultâneos, isso gera cem gravações por segundo no banco de dados. Isso causará lentidão extrema e possíveis travamentos no painel. A solução é otimizar esse intervalo para trinta segundos e registrar dados apenas em momentos de real importância.

Quarto ponto. Ponto cego estratégico.
O administrador sabe o tempo de cada lead individual, mas não tem uma visão agregada do funil de retenção do vídeo. Sem isso, não sabemos em qual minuto exato a maior parte da audiência desiste do webinar. A solução é criar um gráfico de retenção minuto a minuto no painel para otimizar o roteiro do vídeo de vendas.

O relatório detalhado está disponível no arquivo análise results ponto m d na sua pasta.
"@

$speak.Speak($texto)
