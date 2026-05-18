Add-Type -AssemblyName System.speech
$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speak.Rate = 2
$speak.SelectVoice('Microsoft Daniel')
$speak.Speak('O deploy de tudo foi realizado com sucesso absoluto! Todo o código-fonte novo e as traduções foram comitados e enviados para o seu GitHub, disparando a atualização da plataforma em produção na nuvem! Agora a sua plataforma já está sendo atualizada no ar e o recurso premium de um clique no Vercel está disponível e ativo para todos os seus agentes de viagem! Um forte abraço!')
