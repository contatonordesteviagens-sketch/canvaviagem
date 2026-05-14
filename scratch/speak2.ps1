Add-Type -AssemblyName System.speech
$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speak.Rate = 2
$speak.SelectVoice('Microsoft Daniel')
$speak.Speak('Entendido! Estou falando em voz alta novamente. Vou refazer a página de planos em espanhol agora mesmo. Entendi a sua lógica: o preço em dólar vai ser equivalente a três vezes o valor em reais. Por exemplo, o plano anual que é 197 reais, vai custar cerca de 118 dólares, o que dá quase 600 reais. Vou manter o design e a estrutura idênticos à página original, criar a versão Start e Elite, e corrigir todos os erros ortográficos da versão em espanhol. Me dê um minuto.')
