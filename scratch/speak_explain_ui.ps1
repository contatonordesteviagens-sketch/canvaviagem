Add-Type -AssemblyName System.speech
$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speak.Rate = 2
$speak.SelectVoice('Microsoft Daniel')
$speak.Speak('Meu amigo, não se preocupe! O seu token está sim configurado perfeitamente! Deixe-me te explicar por que essa caixinha está vazia. O seu token foi salvo de forma cem por cento segura no arquivo ponto env do seu código local. No entanto, por motivos de segurança e privacidade, a caixinha na tela não exibe o seu token de forma visível para que ninguém que olhe a sua tela possa copiá-lo! Além disso, para testar agora mesmo no seu navegador de forma super rápida, basta você colar o seu token nessa caixinha cinza uma única vez. O seu navegador vai memorizar ele localmente, a mensagem verde de sucesso vai aparecer na hora, e você poderá clicar em Publicar ou Atualizar para ver a mágica acontecer ao vivo na sua conta do Vercel!')
