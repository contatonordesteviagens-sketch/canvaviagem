Add-Type -AssemblyName System.speech
$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speak.Rate = 2
$speak.SelectVoice('Microsoft Daniel')
$speak.Speak('Perfeito, meu amigo! É super simples. Você precisa apenas gerar o Token do Vercel na sua conta. Siga estes três passos rápidos. Primeiro, acesse vercel.com barra account barra tokens. Segundo, clique no botão Create Token, dê o nome de Canva Viagem e escolha a opção Full Access. Terceiro, clique em Create e copie o código gerado que começa com vercel underline. Depois de copiar, basta colar esse código aqui no nosso chat para que eu adicione ao arquivo ponto env do seu projeto em um segundo, ou, se preferir, adicione você mesmo no seu arquivo ponto env! Estou aguardando, vamos deixar o seu sistema funcionando perfeitamente!')
