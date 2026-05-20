Add-Type -AssemblyName System.speech
$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speak.Rate = 2
$speak.SelectVoice('Microsoft Daniel')
$speak.Speak('Olá! Concluí todas as alterações com sucesso. O vídeo da live agora oculta 100% de qualquer barra de título, canal ou botão de compartilhar do YouTube utilizando um zoom proporcional e um deslocamento para cima. Também integrei uma nova seção de edição no painel administrativo de controle da live para gerenciar as mensagens e nomes dos três comentários fixos que aparecem antes do play começar. Tudo já está salvo no seu GitHub e compilando com perfeição!')
