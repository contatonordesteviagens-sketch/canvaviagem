Add-Type -AssemblyName System.speech
$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speak.Rate = 4
$speak.SelectVoice('Microsoft Daniel')
$speak.Speak('Entendido! A partir de agora, eu vou sempre gerar o arquivo e propor o comando para ler minhas respostas em voz alta usando a voz do Daniel na velocidade dois xis. Pode aprovar o comando para ouvir esta mensagem!')
