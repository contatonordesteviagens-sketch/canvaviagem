Add-Type -AssemblyName System.speech
$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speak.Rate = 2
$speak.SelectVoice('Microsoft Daniel')
$speak.Speak('Certo! Entendi perfeitamente agora o que aconteceu com a página de planos. A página de vendas que estava no ar na verdade é a SalesPage, que tem o vídeo vertical. A que eu tinha mexido antes era a página antiga chamada Planos que não estava mais em uso. Eu acabei de clonar a página nova completinha, com o design idêntico ao original, e traduzi literalmente todos os textos e chamadas pra ação, trocando também os preços para a conversão exata do Elite e do Start. Já troquei as rotas, fiz o build local pra garantir que nada quebre e estou subindo no Github agorinha mesmo. Pode testar a página /es/planos em uns minutinhos que ela vai estar bala!')
