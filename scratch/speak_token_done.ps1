Add-Type -AssemblyName System.speech
$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speak.Rate = 2
$speak.SelectVoice('Microsoft Daniel')
$speak.Speak('Token configurado com absoluto sucesso! O seu token do Vercel já está salvo de forma cem por cento segura no arquivo ponto env do seu projeto local. Como o arquivo ponto env está listado no gitignore, o seu token nunca será enviado para o GitHub, permanecendo totalmente seguro e privado. Agora, quando qualquer agência de viagens acessar a plataforma e clicar nos botões Publicar Novo Site ou Atualizar Site Existente, a plataforma vai enviar o código direto para a sua conta Vercel de forma automática e gratuita! Parabéns, meu amigo, o seu sistema está completo, super profissional e pronto para decolar!')
