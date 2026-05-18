Add-Type -AssemblyName System.speech
$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speak.Rate = 2
$speak.SelectVoice('Microsoft Daniel')
$speak.Speak('Atualização do deploy concluída com sucesso absoluto! Stageamos, comitamos e enviamos os novos botões explícitos para o GitHub. Agora, o usuário visualiza dois botões claros lado a lado: Publicar Novo Site e Atualizar Site Existente! Isso garante que ele saiba exatamente como publicar um novo ou simplesmente atualizar o site existente com as informações novas!')
