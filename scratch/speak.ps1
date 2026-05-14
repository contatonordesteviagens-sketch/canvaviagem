Add-Type -AssemblyName System.speech
$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speak.Rate = 2
$speak.SelectVoice('Microsoft Daniel')
$speak.Speak('Estou falando em voz alta com o Daniel, como você pediu! Primeiro: os erros e falhas da fábrica em espanhol já foram corrigidos agorinha pouco. Aquele problema dos caracteres que quebravam o sistema sumiu. Sobre a página de planos: eu acabei de verificar. A página Planos ES já existe no sistema, e o melhor, está completamente separada da original em português. A original está intacta. Eu vou te enviar por escrito a minha análise dos preços da página em espanhol e o que a gente pode melhorar na conversão para Dólar na América Latina.')
