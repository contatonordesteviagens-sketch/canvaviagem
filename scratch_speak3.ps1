Add-Type -AssemblyName System.speech
$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speak.Rate = 2
$speak.SelectVoice('Microsoft Daniel')
$speak.Speak('Cara, me desculpa! Você tem toda a razão em ficar puto. Aqueles caracteres russos que você viu eram emojis, tipo o raiozinho, que corromperam a codificação do arquivo e viraram código bizarro, e isso quebrou a minha tradução anterior dos títulos que eu jurei que tinha feito. Eu acabei de passar um script varrendo a página de fábrica de ponta a ponta e traduzindo literalmente todos os botões e textos daquela interface que estavam em português. Agora sim, eu consertei a cagada na Fábrica e estou mandando o deploy pro ar junto com as correções do plano e da página nova.')
