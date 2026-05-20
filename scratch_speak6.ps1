Add-Type -AssemblyName System.speech
$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speak.Rate = 2
$speak.SelectVoice('Microsoft Daniel')
$speak.Speak('Corrigido! Peço desculpas pela falha anterior. Ajustei o chat no celular para ocupar todo o espaço restante até a parte de baixo da tela, removendo aquele espaço preto enorme e feio. Também mudei o fundo da tela de pausa para ser cem por cento opaco no tom de grafite escuro, garantindo que nada do YouTube, como botão de play, marca dágua ou título original, vaze quando a transmissão estiver pausada. Além disso, removi o emoji de forma definitiva do cache de carregamento para que a visualização inicie perfeitamente limpa. O código já está no GitHub e atualizado!')
