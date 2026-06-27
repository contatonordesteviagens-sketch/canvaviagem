-- Migração de Legendas e Links do Drive
-- Cole este script no SQL Editor do Supabase e clique em RUN

UPDATE public.content_items SET description = '✨ A aventura te espera com Beto Carrero 1! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#BetoCarrero1 #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Beto Carrero 1';
UPDATE public.content_items SET description = '✨ A aventura te espera com Beto Carrero 2! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#BetoCarrero2 #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Beto Carrero 2';
UPDATE public.content_items SET description = 'Com nossos pacotes exclusivos, você pode descobrir o mundo de forma prática, segura e com preços acessíveis. Seja uma viagem rápida ou aquele destino dos seus sonhos, estamos prontos para te levar até lá! 🌎💼
🔹 Pacotes personalizados para todos os perfis de viajantes. 🔹 Condições de pagamento facilitadas. 🔹 Suporte completo durante toda a sua viagem.
🚀 Aproveite nossas ofertas especiais e comece a explorar o mundo!
#DescubraOMundo #ViajeComEstilo #ExploradoresModernos #ViagemDosSonhos #AgenciaDeViagens #PacotesDeViagem #ViajandoPeloMundo' WHERE title = 'Eva - Destinos';
UPDATE public.content_items SET description = 'Descubra as maravilhas de Dubai! 🏙️✨ Com o Burj Khalifa e os shoppings de luxo, Dubai é um destino moderno e fascinante. Nosso pacote a partir de 10x de R$450,00 inclui ✈️ passagens, 🏨 hospedagem e passeios para conhecer o deserto e a cidade.
✔️ Um destino internacional cheio de glamour te espera.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#BelezasDeDubai #ViajarPeloMundo #FériasInternacionais', drive_url = 'https://drive.google.com/file/d/13BCK3_0ZhbK0Ogenc8bAydyOObsUcmlG/view?usp=drive_link' WHERE title = 'Eva - Dubai 2';
UPDATE public.content_items SET description = 'Viaje sozinho para Paris com segurança! 🗼✨ Conhecida pela Torre Eiffel e pelos cafés, Paris é perfeita para uma aventura solo. Confira dicas essenciais para uma jornada tranquila, como escolher hotéis seguros e planejar seu roteiro.
✔️ Salve essas dicas e curta sua viagem com confiança.
Planeje sua aventura pelo WhatsApp: (99) 9 9999-9999
#DicasDeSegurança #ViajarSozinho #ViagemSegura' WHERE title = 'Eva - Paris 2';
UPDATE public.content_items SET description = 'Evite imprevistos em Roma! 🏛️✈️ Chegue cedo ao aeroporto e mantenha seus documentos como passaporte 🛂 à mão para uma viagem tranquila. Roma é famosa pelo Coliseu e pela culinária italiana, como a carbonara autêntica.
✔️ Dicas para curtir a Cidade Eterna sem estresse.
Planeje pelo WhatsApp: (99) 9 9999-9999
#DicasDeViagem #ViajarSemEstresse #PlanejamentoDeViagem' WHERE title = 'Eva - Roma';
UPDATE public.content_items SET description = 'Levante cedo para viajar para Foz do Iguaçu e viva um dia incrível! 🌊✨ As Cataratas e o Parque das Aves são paradas obrigatórias nesse destino cheio de natureza. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem para você começar o dia com o pé direito.
✔️ Nada como um amanhecer rumo a um destino dos sonhos.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#AcordarCedo #ViagemDosSonhos #FériasIncríveis', drive_url = 'https://drive.google.com/file/d/10i5BGZUQ9BxjzOhbFCRQ-dJUhltV8nav/view?usp=drive_link' WHERE title = 'Eva - Foz do Iguaçu';
UPDATE public.content_items SET description = '✨ Descubra as maravilhas de Namíbia! ✈️🌍

Celebre o Dia do Turista em Namíbia! 🏜️📸 Explore desertos como o Namib, safáris com elefantes e a cultura local única. Nossos pacotes oferecem ✈️ passagens e 🏨 hospedagem para você viver aventuras inesquecíveis nesse destino africano. ✔️ O mundo é cheio de descobertas para viajantes apaixonados. Planeje sua viagem pelo WhatsApp: (99) 9 9999-9999

🔥 Imagine você relaxando e aproveitando cada momento sem preocupações. Nosso pacote é pensado para você viver o melhor dessa viagem e colecionar momentos inesquecíveis!

👇 Clique no link da BIO ou nos chame no WhatsApp para garantir seu pacote exclusivo agora!
📲 (99) 9 9999-9999

#DiaDoTurista #ExplorarOMundo #FériasInesquecíveis' WHERE title = 'Bia - Ceará';
UPDATE public.content_items SET description = '✨ Descubra as maravilhas de Namíbia! ✈️🌍

Celebre o Dia do Turista em Namíbia! 🏜️📸 Explore desertos como o Namib, safáris com elefantes e a cultura local única. Nossos pacotes oferecem ✈️ passagens e 🏨 hospedagem para você viver aventuras inesquecíveis nesse destino africano. ✔️ O mundo é cheio de descobertas para viajantes apaixonados. Planeje sua viagem pelo WhatsApp: (99) 9 9999-9999

🔥 Imagine você relaxando e aproveitando cada momento sem preocupações. Nosso pacote é pensado para você viver o melhor dessa viagem e colecionar momentos inesquecíveis!

👇 Clique no link da BIO ou nos chame no WhatsApp para garantir seu pacote exclusivo agora!
📲 (99) 9 9999-9999

#DiaDoTurista #ExplorarOMundo #FériasInesquecíveis' WHERE title = 'Bia - Canoa Quebrada';
UPDATE public.content_items SET description = 'Viaje para Jericoacoara - CE 2 com segurança e tranquilidade! 🧳✈️ Adicione o seguro bagagem ao seu pacote e proteja sua mala contra perdas, danos ou extravios. Jeri é um destino mágico, e queremos que você curta cada momento sem imprevistos.
✔️ Cobertura completa e assistência rápida para qualquer situação.
Adicione ao seu pacote pelo WhatsApp: (99) 9 9999-9999
#SeguroBagagem #ViagemTranquila #ViajarComSegurança', drive_url = 'https://drive.google.com/file/d/11KjCpWManwQUucEcR5MNJWL-a5-U1jdr/view?usp=drive_link' WHERE title = 'Bia - Jericoacoara';
UPDATE public.content_items SET description = '✨ A aventura te espera com 1ª vez no aeroporto! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#1ªveznoaeroporto #ViagemPerfeita #AgenciaDeViagens' WHERE title = '1ª vez no aeroporto';
UPDATE public.content_items SET description = '✨ A aventura te espera com 5 motivos stopover! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#5motivosstopover #ViagemPerfeita #AgenciaDeViagens' WHERE title = '5 motivos stopover';
UPDATE public.content_items SET description = '✨ A aventura te espera com Bagagem de mãos! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#Bagagemdemãos #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Bagagem de mãos';
UPDATE public.content_items SET description = 'Planeje sua primeira aventura como mochileiro em Colômbia! 🏔️🧳 Conhecida por Cartagena e Medellín, a Colômbia é um destino épico. Dicas como levar uma mochila leve e reservar passeios guiados garantem uma viagem sem estresse.
✔️ Um guia essencial para começar sua jornada.
Salve e planeje pelo WhatsApp: (99) 9 9999-9999
#MochileirosDePrimeiraViagem #DicasDeMochileiro #AventuraPeloMundo 
Veneza
Explore Veneza sem gastar muito! 🚤✨ Com os canais e a Praça de São Marcos, Veneza é mágica. Dicas como viajar na baixa temporada e escolher hospedagens econômicas ajudam a curtir ao máximo com orçamento limitado.
✔️ Aproveite sua próxima aventura italiana com pouco.
Planeje pelo WhatsApp: (99) 9 9999-9999
#ViajarComPouco #DicasDeViagem #ViagemEconomica', drive_url = 'https://drive.google.com/file/d/16Jfb9ZRiR6uAG6VV0rSxpsKv1cQE4L0L/view?usp=drive_link' WHERE title = 'Colômbia';
UPDATE public.content_items SET description = '✨ A aventura te espera com Destinos Europa! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#DestinosEuropa #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Destinos Europa';
UPDATE public.content_items SET description = '✨ A aventura te espera com Erros Aeroporto! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#ErrosAeroporto #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Erros Aeroporto';
UPDATE public.content_items SET description = '✨ A aventura te espera com Eu sei que...! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#Euseique... #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Eu sei que...';
UPDATE public.content_items SET description = '✨ A aventura te espera com Green Island! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#GreenIsland #ViagemPerfeita #AgenciaDeViagens', drive_url = 'https://drive.google.com/file/d/16I46MjTa3z2VYwtwWxQ5Vn2huBXG9HAu/view?usp=drive_link' WHERE title = 'Green Island';
UPDATE public.content_items SET description = 'Passaporte vencido antes de ir para Itália? 🛂✈️ Não se preocupe! Saiba como resolver rapidamente: renove com antecedência e verifique as exigências do destino. Itália tem Roma, Veneza e a Costa Amalfitana, destinos imperdíveis.
✔️ Planeje com antecedência e evite problemas no embarque.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#PassaporteVencido #DicasDeViagem #PlanejamentoDeViagem', drive_url = 'https://drive.google.com/file/d/123DM5h9VObNWH2PC7sMw9RfpNQb2j0tE/view?usp=drive_link' WHERE title = 'Itália';
UPDATE public.content_items SET description = '✨ A aventura te espera com Itens Proibidos na Viagem! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#ItensProibidosnaViagem #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Itens Proibidos na Viagem';
UPDATE public.content_items SET description = '✨ A aventura te espera com Lugares para conhecer! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#Lugaresparaconhecer #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Lugares para conhecer';
UPDATE public.content_items SET description = 'Viaje sozinho para Paris com segurança! 🗼✨ Conhecida pela Torre Eiffel e pelos cafés, Paris é perfeita para uma aventura solo. Confira dicas essenciais para uma jornada tranquila, como escolher hotéis seguros e planejar seu roteiro.
✔️ Salve essas dicas e curta sua viagem com confiança.
Planeje sua aventura pelo WhatsApp: (99) 9 9999-9999
#DicasDeSegurança #ViajarSozinho #ViagemSegura' WHERE title = 'Paris';
UPDATE public.content_items SET description = '✨ A aventura te espera com Passeios vale a pena?! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#Passeiosvaleapena? #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Passeios vale a pena?';
UPDATE public.content_items SET description = '✨ A aventura te espera com Resort All inclusive! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#ResortAllinclusive #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Resort All inclusive';
UPDATE public.content_items SET description = '✨ A aventura te espera com Tipos de viajantes! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#Tiposdeviajantes #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Tipos de viajantes';
UPDATE public.content_items SET description = 'Está na hora de planejar suas férias dos sonhos no Vale Sagrado! 🏔️✨ ComSorry about that, something didn''t go as planned. Please try again, and if you''re still seeing this message, go ahead and restart the app.






LEGENDAS AGÊNCIA DE VIAGEM
ARTE 1
Está na hora de deixar de sonhar e começar a planejar suas férias dos sonhos. Que tal curtir 5 dias no paraíso, com tudo que você precisa para relaxar e aproveitar ao máximo? 😎🌊
🔸 Pacote Completo Inclui: ✈️ Passagem aérea de ida e volta 🧳 Bagagem despachada 🏨 5 diárias em hotel de luxo
E o melhor: você pode fazer tudo isso em até 10x de R$450,00! Não perca a chance de viver essa experiência única. 🌟
📲 Garanta já o seu pacote e prepare-se para uma aventura que vai ficar marcada na memória!
#ViajarÉViver #CancunDream #AgenciaDeViagens #PacotesDeViagem #DestinoDosSonhos  #DescontoEspecial', drive_url = 'https://drive.google.com/file/d/153DwvNqOJzPksR1XjUXHoMYp6IX79_n2/view?usp=drive_link' WHERE title = 'Vale Sagrado';
UPDATE public.content_items SET description = 'Viaje em família para Veneza! 🚤✨ Conhecida pelos canais e pela Praça de São Marcos, Veneza é mágica para crianças e adultos. Outras opções incríveis incluem Paris, Orlando e Lisboa, com pacotes que incluem ✈️ passagens e 🏨 hospedagem.
✔️ Momentos inesquecíveis para todas as idades garantidos.
Planeje agora pelo WhatsApp: (99) 9 9999-9999
#ViagemComCrianças #FériasEmFamília #Veneza', drive_url = 'https://drive.google.com/file/d/14z2pfoMaPJaaYmorF3wri-7h0YT00rtD/view?usp=drive_link' WHERE title = 'Veneza';
UPDATE public.content_items SET description = 'Relembre momentos incríveis em Florianópolis - SC! 🏖️🌅 Conhecida como a "Ilha da Magia", Floripa tem praias para todos os gostos, de Jurerê a Campeche. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem, para você planejar sua próxima viagem dos sonhos.
✔️ Um destino com paisagens de tirar o fôlego e muita diversão.
Descubra mais pelo WhatsApp: (99) 9 9999-9999
#Florianópolis #TBTDeViagem #DestinoIncrível', drive_url = 'https://drive.google.com/file/d/10WpZTgI6o3Tunt9zZfOhl78qJwFHA_K6/view?usp=drive_link' WHERE title = 'Florianópolis';
UPDATE public.content_items SET description = 'Evite surpresas no aeroporto ao viajar para Gramado! 🧳✈️ Confira dicas para não ter problemas com excesso de bagagem e curta o charme da Serra Gaúcha, com suas ruas floridas e o clima europeu. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem.
✔️ Viaje tranquilo e aproveite cada momento sem estresse.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#DicasDeViagem #ExcessoDeBagagem #ViagemSemEstresse', drive_url = 'https://drive.google.com/file/d/11L2RzID7XdutobpsEidXivyKsuumC2zs/view?usp=drive_link' WHERE title = 'Gramado';
UPDATE public.content_items SET description = 'Sonha com o Jalapão - TO? 🏜️🌄 Esse destino é famoso pelas dunas douradas, cachoeiras cristalinas e fervedouros únicos. Nosso pacote a partir de R$2.500 inclui ✈️ passagens, 🏨 hospedagem e passeios guiados para explorar o melhor da região.
✔️ Uma experiência de tranquilidade e conexão com a natureza.
Garanta sua viagem pelo WhatsApp: (99) 9 9999-9999
#Jalapão #DestinoDosSonhos #FériasNoParaíso', drive_url = 'https://drive.google.com/file/d/112UUcnFQlh6a6j4QtLXuyX83KO9w6MKZ/view?usp=drive_link' WHERE title = 'Jalapão -';
UPDATE public.content_items SET description = '✨ A aventura te espera com João Pessoa! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#JoãoPessoa #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'João Pessoa';
UPDATE public.content_items SET description = 'Está na hora de planejar suas férias dos sonhos em Maceió - AL! 🌴✨ Curta 5 dias nesse paraíso nordestino com praias de águas cristalinas e coqueiros que parecem de cartão-postal. Nosso pacote inclui: ✈️ passagens aéreas de ida e volta, 🧳 bagagem despachada e 🏨 5 diárias em um hotel de luxo com vista para o mar. Tudo isso por apenas 10x de R$450,00!
✔️ Um destino perfeito para relaxar e tirar fotos incríveis 📸.
Garanta seu pacote agora no WhatsApp: (99) 9 9999-9999
#ViajarÉViver #MaceióDream #AgenciaDeViagens', drive_url = 'https://drive.google.com/file/d/11EaH5lDoZ-vz7qlySeti0YlYF71VXQb8/view?usp=drive_link' WHERE title = 'Maceió - AL';
UPDATE public.content_items SET description = 'Descubra as maravilhas de Maragogi! 🐠🌴 Suas águas cristalinas e corais são perfeitas para snorkeling e passeios de buggy. Nosso pacote a partir de 10x de R$450,00 inclui ✈️ passagens, 🏨 hospedagem e traslados para você aproveitar o melhor do destino.
✔️ Um pedacinho do paraíso brasileiro te espera.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#BelezasDoBrasil #ViajarPeloBrasil #FériasNoBrasil', drive_url = 'https://drive.google.com/file/d/10LeDT87lhcl9XFOck533SscCs5I2iqqZ/view?usp=drive_link' WHERE title = 'Maragogi';
UPDATE public.content_items SET description = 'Curta o calor em 3 paraísos: Natal - RN, Porto de Galinhas e Angra dos Reis! 🏖️☀️ Natal tem dunas incríveis e passeios de buggy em Genipabu, perfeitos para o verão. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para você escolher seu destino favorito.
✔️ Três opções de praias paradisíacas para suas férias.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
 #DestinosDeVerão #ViajarÉViver', drive_url = 'https://drive.google.com/file/d/1vYhYavLpGaDnMdvti8tmHV_CAsv-MLNG/view?usp=drive_link' WHERE title = 'Natal -';
UPDATE public.content_items SET description = 'Viva dias inesquecíveis no Pantanal! 🐾🌿 Conhecido pela biodiversidade, esse destino é ideal para safáris fotográficos e observação de animais como onças e jacarés. Nosso pacote para 2 adultos inclui ✈️ passagens e hospedagem, por apenas R$2.900.
✔️ Uma aventura na natureza que você nunca vai esquecer.
Garanta sua viagem pelo WhatsApp: (99) 9 9999-9999
#PantanalDosSonhos #PacoteDeViagem #FériasInesquecíveis', drive_url = 'https://drive.google.com/file/d/11-A9Nw4g9P0pY-FbtgeV2PNQBir1qi3E/view?usp=drive_link' WHERE title = 'Pantanal';
UPDATE public.content_items SET description = 'Descubra o Rio de Janeiro e viva experiências únicas! 🌄✨ Conhecida como a Cidade Maravilhosa, o Rio tem o Cristo Redentor, o Pão de Açúcar e praias famosas como Copacabana. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar os pontos turísticos mais icônicos.
✔️ Uma viagem para se encantar com cada cantinho da cidade.
Entre em contato pelo WhatsApp: (99) 9 9999-9999
#ViajarÉViver #MagiaDosDestinos #FériasInesquecíveis', drive_url = 'https://drive.google.com/file/d/10WyscibbG8F45bzSUJ0LWxhRYNBq9UiX/view?usp=drive_link' WHERE title = 'Rio de Janeiro';
UPDATE public.content_items SET description = 'Cada passo da sua viagem pela Rota das Emoções é memorável! 🏜️🚤 Esse roteiro inclui Lençóis Maranhenses, Delta do Parnaíba e Jericoacoara, com paisagens de tirar o fôlego. Nosso pacote oferece ✈️ passagens, 🏨 hospedagem e passeios guiados para curtir cada detalhe.
✔️ A aventura está em cada parada dessa jornada incrível.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#JornadaDeViagem #FériasIncríveis #ExperiênciasInesquecíveis' WHERE title = 'Rota das Emoções';
UPDATE public.content_items SET description = 'Evite erros ao planejar sua viagem para Seychelles! 🏝️✈️ Conhecidas pelas praias de areia branca e tartarugas gigantes, as Seychelles são um paraíso. Confira dicas para uma jornada sem dores de cabeça, com ✈️ passagens e 🏨 hospedagem organizadas por nós.
✔️ Viaje com mais segurança e aproveite cada momento.
Planeje pelo WhatsApp: (99) 9 9999-9999
#DicasDeViagem #ViagemInternacional #ViajarSemEstresse', drive_url = 'https://drive.google.com/file/d/15Zv4yNxO22wgGS3ndsdBMIFMJZrGEQLn/view?usp=drive_link' WHERE title = 'Seychelles';
UPDATE public.content_items SET description = '✨ A aventura te espera com Talin Estônia! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#TalinEstônia #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Talin Estônia';
UPDATE public.content_items SET description = 'Escolha o destino perfeito para Tailândia! 🏝️✨ Conhecida pelos templos, mercados e praias como Krabi, a Tailândia é ideal para todos os estilos. Nossa equipe te ajuda a planejar a viagem dos sonhos, com ✈️ passagens e 🏨 hospedagem inclusas.
✔️ Um lugar para relaxar, explorar ou se aventurar.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#DestinoIdeal #PlanejeSuaViagem #FériasDosSonhos', drive_url = 'https://drive.google.com/file/d/15htqp9okcLW1Bdoaql8VXAB8Rqpy3cI1/view?usp=drive_link' WHERE title = 'Tailândia';
UPDATE public.content_items SET description = 'Viaje em família para Veneza! 🚤✨ Conhecida pelos canais e pela Praça de São Marcos, Veneza é mágica para crianças e adultos. Outras opções incríveis incluem Paris, Orlando e Lisboa, com pacotes que incluem ✈️ passagens e 🏨 hospedagem.
✔️ Momentos inesquecíveis para todas as idades garantidos.
Planeje agora pelo WhatsApp: (99) 9 9999-9999
#ViagemComCrianças #FériasEmFamília #Veneza', drive_url = 'https://drive.google.com/file/d/14z2pfoMaPJaaYmorF3wri-7h0YT00rtD/view?usp=drive_link' WHERE title = 'Veneza';
UPDATE public.content_items SET description = '✨ A aventura te espera com Bia (Black Friday)! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#Bia(BlackFriday) #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Bia (Black Friday)';
UPDATE public.content_items SET description = '✨ Descubra as maravilhas de Salvador - BA! ✈️🌍

Viajar para Salvador - BA é colecionar momentos inesquecíveis! 🎭🌴 Explore o Pelourinho, prove o acarajé e sinta a energia única da Bahia. Nossos pacotes oferecem ✈️ passagens e 🏨 hospedagem, para você viver uma experiência cultural rica e vibrante. ✔️ Invista em memórias que valem mais que qualquer coisa. Planeje pelo WhatsApp: (99) 9 9999-9999

🔥 Imagine você relaxando e aproveitando cada momento sem preocupações. Nosso pacote é pensado para você viver o melhor dessa viagem e colecionar momentos inesquecíveis!

👇 Clique no link da BIO ou nos chame no WhatsApp para garantir seu pacote exclusivo agora!
📲 (99) 9 9999-9999

#ViajarÉInvestir #FériasPerfeitas #MomentosInesquecíveis', drive_url = 'https://drive.google.com/file/d/11Ea8Vvrgff2o7h-FKfeHpvmAPG6mnd4M/view?usp=drive_link' WHERE title = 'Bia (Carnaval Salvador)';
UPDATE public.content_items SET description = '✨ A aventura te espera com Bia (Destino dos sonhos)! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#Bia(Destinodossonhos) #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Bia (Destino dos sonhos)';
UPDATE public.content_items SET description = '✨ Descubra as maravilhas de Natal - RN! ✈️🌍

Curta o calor em 3 paraísos: Natal - RN, Porto de Galinhas e Angra dos Reis! 🏖️☀️ Natal tem dunas incríveis e passeios de buggy em Genipabu, perfeitos para o verão. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para você escolher seu destino favorito. ✔️ Três opções de praias paradisíacas para suas férias. Fale com a gente pelo WhatsApp: (99) 9 9999-9999

🔥 Imagine você relaxando e aproveitando cada momento sem preocupações. Nosso pacote é pensado para você viver o melhor dessa viagem e colecionar momentos inesquecíveis!

👇 Clique no link da BIO ou nos chame no WhatsApp para garantir seu pacote exclusivo agora!
📲 (99) 9 9999-9999

#DestinosDeVerão #ViajarÉViver' WHERE title = 'Bia (Natal em família)';
UPDATE public.content_items SET description = '✨ A aventura te espera com Bia (Pacote Completo)! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#Bia(PacoteCompleto) #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Bia (Pacote Completo)';
UPDATE public.content_items SET description = '✨ Descubra as maravilhas de Natal - RN! ✈️🌍

Curta o calor em 3 paraísos: Natal - RN, Porto de Galinhas e Angra dos Reis! 🏖️☀️ Natal tem dunas incríveis e passeios de buggy em Genipabu, perfeitos para o verão. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para você escolher seu destino favorito. ✔️ Três opções de praias paradisíacas para suas férias. Fale com a gente pelo WhatsApp: (99) 9 9999-9999

🔥 Imagine você relaxando e aproveitando cada momento sem preocupações. Nosso pacote é pensado para você viver o melhor dessa viagem e colecionar momentos inesquecíveis!

👇 Clique no link da BIO ou nos chame no WhatsApp para garantir seu pacote exclusivo agora!
📲 (99) 9 9999-9999

#DestinosDeVerão #ViajarÉViver' WHERE title = 'Bia (Presente Natal)';
UPDATE public.content_items SET description = '✨ A aventura te espera com Bia (Réveillon Rio)! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#Bia(RéveillonRio) #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Bia (Réveillon Rio)';
UPDATE public.content_items SET description = '✨ A aventura te espera com Bia Black Friday 2! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#BiaBlackFriday2 #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Bia Black Friday 2';
UPDATE public.content_items SET description = '✨ A aventura te espera com Black Friday 35% Off! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#BlackFriday35%Off #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Black Friday 35% Off';
UPDATE public.content_items SET description = '✨ A aventura te espera com Carnaval Nordeste! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#CarnavalNordeste #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Carnaval Nordeste';
UPDATE public.content_items SET description = 'Curta o calor em 3 paraísos: Natal - RN, Porto de Galinhas e Angra dos Reis! 🏖️☀️ Natal tem dunas incríveis e passeios de buggy em Genipabu, perfeitos para o verão. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para você escolher seu destino favorito.
✔️ Três opções de praias paradisíacas para suas férias.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
 #DestinosDeVerão #ViajarÉViver', drive_url = 'https://drive.google.com/file/d/1vYhYavLpGaDnMdvti8tmHV_CAsv-MLNG/view?usp=drive_link' WHERE title = 'Celebre o Natal';
UPDATE public.content_items SET description = '✨ A aventura te espera com Eva - Black Friday! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#EvaBlackFriday #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Eva - Black Friday';
UPDATE public.content_items SET description = '✨ A aventura te espera com Eva - Destinos Feriados! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#EvaDestinosFeriados #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Eva - Destinos Feriados';
UPDATE public.content_items SET description = '✨ A aventura te espera com Eva - Feriados Viagens! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#EvaFeriadosViagens #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Eva - Feriados Viagens';
UPDATE public.content_items SET description = 'Curta o calor em 3 paraísos: Natal - RN, Porto de Galinhas e Angra dos Reis! 🏖️☀️ Natal tem dunas incríveis e passeios de buggy em Genipabu, perfeitos para o verão. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para você escolher seu destino favorito.
✔️ Três opções de praias paradisíacas para suas férias.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
 #DestinosDeVerão #ViajarÉViver', drive_url = 'https://drive.google.com/file/d/1vYhYavLpGaDnMdvti8tmHV_CAsv-MLNG/view?usp=drive_link' WHERE title = 'Frase de Natal';
UPDATE public.content_items SET description = '✨ A aventura te espera com Frase Réveillon! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#FraseRéveillon #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Frase Réveillon';
UPDATE public.content_items SET description = '✨ A aventura te espera com Mel (Black Friday)! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#Mel(BlackFriday) #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Mel (Black Friday)';
UPDATE public.content_items SET description = '✨ A aventura te espera com Mel (Destinos Feriados)! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#Mel(DestinosFeriados) #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Mel (Destinos Feriados)';
UPDATE public.content_items SET description = '✨ A aventura te espera com Mel (Semana Santa)! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#Mel(SemanaSanta) #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Mel (Semana Santa)';
UPDATE public.content_items SET description = '✨ Descubra as maravilhas de Cuzumel! ✈️🌍

Explore Cuzumel com conforto e sem preocupações! 🏝️🌊 Esse paraíso mexicano é famoso pelos recifes de corais e mergulhos incríveis. Nosso pacote inclui 5 diárias, ✈️ passagens de ida e volta, transfer do aeroporto ao hotel e passeios exclusivos, por apenas R$1.500 por pessoa. ✔️ Uma viagem para relaxar e explorar o Caribe. Garanta sua viagem pelo WhatsApp: (99) 9 9999-9999

🔥 Imagine você relaxando e aproveitando cada momento sem preocupações. Nosso pacote é pensado para você viver o melhor dessa viagem e colecionar momentos inesquecíveis!

👇 Clique no link da BIO ou nos chame no WhatsApp para garantir seu pacote exclusivo agora!
📲 (99) 9 9999-9999

#DescubraCuzumel #PacotesDeViagem #FériasInesquecíveis' WHERE title = 'Mel - Black Friday Europa';
UPDATE public.content_items SET description = '✨ Descubra as maravilhas de Cuzumel! ✈️🌍

Explore Cuzumel com conforto e sem preocupações! 🏝️🌊 Esse paraíso mexicano é famoso pelos recifes de corais e mergulhos incríveis. Nosso pacote inclui 5 diárias, ✈️ passagens de ida e volta, transfer do aeroporto ao hotel e passeios exclusivos, por apenas R$1.500 por pessoa. ✔️ Uma viagem para relaxar e explorar o Caribe. Garanta sua viagem pelo WhatsApp: (99) 9 9999-9999

🔥 Imagine você relaxando e aproveitando cada momento sem preocupações. Nosso pacote é pensado para você viver o melhor dessa viagem e colecionar momentos inesquecíveis!

👇 Clique no link da BIO ou nos chame no WhatsApp para garantir seu pacote exclusivo agora!
📲 (99) 9 9999-9999

#DescubraCuzumel #PacotesDeViagem #FériasInesquecíveis' WHERE title = 'Mel - Feriado Páscoa';
UPDATE public.content_items SET description = '✨ Descubra as maravilhas de Cuzumel! ✈️🌍

Explore Cuzumel com conforto e sem preocupações! 🏝️🌊 Esse paraíso mexicano é famoso pelos recifes de corais e mergulhos incríveis. Nosso pacote inclui 5 diárias, ✈️ passagens de ida e volta, transfer do aeroporto ao hotel e passeios exclusivos, por apenas R$1.500 por pessoa. ✔️ Uma viagem para relaxar e explorar o Caribe. Garanta sua viagem pelo WhatsApp: (99) 9 9999-9999

🔥 Imagine você relaxando e aproveitando cada momento sem preocupações. Nosso pacote é pensado para você viver o melhor dessa viagem e colecionar momentos inesquecíveis!

👇 Clique no link da BIO ou nos chame no WhatsApp para garantir seu pacote exclusivo agora!
📲 (99) 9 9999-9999

#DescubraCuzumel #PacotesDeViagem #FériasInesquecíveis' WHERE title = 'Mel - Viagens Feriados';
UPDATE public.content_items SET description = 'Curta o calor em 3 paraísos: Natal - RN, Porto de Galinhas e Angra dos Reis! 🏖️☀️ Natal tem dunas incríveis e passeios de buggy em Genipabu, perfeitos para o verão. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para você escolher seu destino favorito.
✔️ Três opções de praias paradisíacas para suas férias.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
 #DestinosDeVerão #ViajarÉViver', drive_url = 'https://drive.google.com/file/d/1vYhYavLpGaDnMdvti8tmHV_CAsv-MLNG/view?usp=drive_link' WHERE title = 'Natal dos Sonhos';
UPDATE public.content_items SET description = 'Evite surpresas no aeroporto ao viajar para Gramado! 🧳✈️ Confira dicas para não ter problemas com excesso de bagagem e curta o charme da Serra Gaúcha, com suas ruas floridas e o clima europeu. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem.
✔️ Viaje tranquilo e aproveite cada momento sem estresse.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#DicasDeViagem #ExcessoDeBagagem #ViagemSemEstresse', drive_url = 'https://drive.google.com/file/d/11L2RzID7XdutobpsEidXivyKsuumC2zs/view?usp=drive_link' WHERE title = 'Natal Gramado';
UPDATE public.content_items SET description = '✨ A aventura te espera com Páscoa Relaxante! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#PáscoaRelaxante #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Páscoa Relaxante';
UPDATE public.content_items SET description = '✨ A aventura te espera com Réveillon Nacional! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#RéveillonNacional #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Réveillon Nacional';
UPDATE public.content_items SET description = '✨ A aventura te espera com Réveillon Rio! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#RéveillonRio #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Réveillon Rio';
UPDATE public.content_items SET description = '✨ A aventura te espera com Réveillon Viagem! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#RéveillonViagem #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Réveillon Viagem';
UPDATE public.content_items SET description = 'Explore a África sem gastar muito! 🦒📸 De safáris na Tanzânia a praias em Zanzibar, há opções para todos os bolsos. Dicas como viajar na baixa temporada e escolher hospedagens econômicas ajudam a curtir ao máximo.
✔️ Aproveite sua próxima aventura africana com orçamento limitado.
Planeje pelo WhatsApp: (99) 9 9999-9999
#ViajarComPouco #DicasDeViagem #ViagemEconomica', drive_url = 'https://drive.google.com/file/d/17Ofo4jAnLbnikaWetBAx6tJnvmjau_8q/view?usp=drive_link' WHERE title = 'África';
UPDATE public.content_items SET description = 'Viaje para Aruba com segurança! 🏖️✈️ Adicione o seguro bagagem ao seu pacote e proteja sua mala contra perdas ou extravios. Aruba é famosa pelas praias de Eagle Beach e pela vibe caribenha, perfeita para relaxar.
✔️ Cobertura completa para curtir sem preocupações.
Adicione ao seu pacote pelo WhatsApp: (99) 9 9999-9999
#SeguroBagagem #ViagemTranquila #ViajarComSegurança', drive_url = 'https://drive.google.com/file/d/14Qetkp_UKJzEmhgR6phVqsUPt0qgFQEW/view?usp=drive_link' WHERE title = 'Aruba';
UPDATE public.content_items SET description = 'Planeje sua viagem para Bariloche sem preocupações! ❄️✈️ Conhecida pelas montanhas nevadas e chocolates artesanais, Bariloche é perfeita para o inverno. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para esquiar, em até 10x sem juros.
✔️ Suporte personalizado para você curtir cada momento.
Fale conosco pelo WhatsApp: (99) 9 9999-9999
#ViajarSemPreocupação #PacoteDeViagem #AgenciaDeViagens', drive_url = 'https://drive.google.com/file/d/13lituNWpsQYcVpH-B2iBYWaYMZHAFZiP/view?usp=drive_link' WHERE title = 'Bariloche';
UPDATE public.content_items SET description = 'Curta dias de sol em Boston! 🏛️✨ Explore a Freedom Trail e o charme histórico dessa cidade americana. Nossos pacotes especiais incluem ✈️ passagens, 🏨 hospedagem e passeios, com facilidade de pagamento para tornar sua viagem ainda mais tranquila.
✔️ Uma aventura inesquecível te espera na Nova Inglaterra.
Garanta sua vaga pelo WhatsApp: (99) 9 9999-9999
#PartiuBoston #ViagemDosSonhos #FériasIncríveis', drive_url = 'https://drive.google.com/file/d/17CJOrapIBVZl5PoVHAvOU4PPT4NsJIjh/view?usp=drive_link' WHERE title = 'Boston';
UPDATE public.content_items SET description = 'Passaporte vencido antes de ir para Bruxelas? 🛂✈️ Não se preocupe! Saiba como resolver rapidamente: renove com antecedência e verifique as exigências do destino. Bruxelas é famosa pelo chocolate e pela Grand Place, um destino imperdível.
✔️ Planeje com antecedência e evite problemas no embarque.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#PassaporteVencido #DicasDeViagem #PlanejamentoDeViagem' WHERE title = 'Bruxelas';
UPDATE public.content_items SET description = 'Transforme seus sonhos em realidade em Budapeste! 🏰✨ Conhecida pelo Parlamento e pelas termas, Budapeste é perfeita para quem ama história e relaxamento. Nossos pacotes personalizados incluem ✈️ passagens, 🏨 hospedagem e passeios para explorar a cidade.
✔️ Uma viagem para se encantar com a Europa Oriental.
Planeje sua aventura pelo WhatsApp: (99) 9 9999-9999
#ExplorarOMundo #ViagemSemComplicação #AgenciaDeViagens', drive_url = 'https://drive.google.com/file/d/14CUIscnbzCX9DM1Ui9CRWiGG6Px2uVwd/view?usp=drive_link' WHERE title = 'Budapeste';
UPDATE public.content_items SET description = 'Nossos clientes amam suas viagens para Cancún! 🏖️✨ Com praias de areia branca e águas turquesas, Cancún é um paraíso no México. Trabalhamos para garantir que cada experiência seja única, com ✈️ passagens e 🏨 hospedagem inclusas.
✔️ Faça parte dessas histórias de sucesso e viva o Caribe.
Planeje sua viagem pelo WhatsApp: (99) 9 9999-9999
#FeedbackDeClientes #ViagemIncrível #SatisfaçãoGarantida', drive_url = 'https://drive.google.com/file/d/12RpuACuT0MGESYXOxra0kRm291OLXBtz/view?usp=drive_link' WHERE title = 'Cancún';
UPDATE public.content_items SET description = 'Busca aventura na Capadócia? 🎈✨ Conhecida pelos passeios de balão e pelas formações rochosas únicas, a Capadócia é perfeita para quem ama emoção. Nossos pacotes cheios de adrenalina incluem ✈️ passagens e hospedagem, a partir de 10x de R$190,00.
✔️ Um destino para explorar e se divertir ao máximo.
Garanta sua vaga pelo WhatsApp: (99) 9 9999-9999
#DestinoDeAventura #PacotesDeViagem #ViagemAventura', drive_url = 'https://drive.google.com/file/d/11joLZdCBVZ7MkrXEqRVgoR76vJ4SpdpX/view?usp=drive_link' WHERE title = 'Capadócia';
UPDATE public.content_items SET description = 'Não deixe seus sonhos de viagem para Chicago para depois! 🏙️✨ Conhecida pela arquitetura e pela pizza deep-dish, Chicago é um destino vibrante. Nossos pacotes personalizados incluem ✈️ passagens, 🏨 hospedagem e passeios, com facilidade no pagamento.
✔️ Ofertas especiais para você explorar essa cidade incrível.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#ViajeMaisVivaMais #PacotesDeViagem #FériasDosSonhos', drive_url = 'https://drive.google.com/file/d/176Y8TsXip9DhhKgtoxWDJ3i27nzvS599/view?usp=drive_link' WHERE title = 'Chicago';
UPDATE public.content_items SET description = '✨ A aventura te espera com Cozumel! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#Cozumel #ViagemPerfeita #AgenciaDeViagens', drive_url = 'https://drive.google.com/file/d/12kazChdZyF0deFFzuIZ1Cq2Dj8d7rYsp/view?usp=drive_link' WHERE title = 'Cozumel';
UPDATE public.content_items SET description = 'Prepare-se para Cusco! 🏔️🧳 Saiba como agir se sua bagagem for extraviada: informe a companhia aérea, tenha o comprovante de despacho e contrate um seguro viagem. Cusco é a porta de entrada para Machu Picchu, com história e cultura incríveis.
✔️ Dicas para resolver imprevistos e curtir sua viagem.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#DicasDeViagem #BagagemExtraviada #ViagemSemEstresse', drive_url = 'https://drive.google.com/file/d/13lnK_smqj5kU7ukYH21H6bKs1hXyWkH9/view?usp=drive_link' WHERE title = 'Cusco';
UPDATE public.content_items SET description = '✨ A aventura te espera com DISNEY! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#DISNEY #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'DISNEY';
UPDATE public.content_items SET description = 'Viaje sozinho para Dublin com segurança! 🍀✨ Conhecida pelos pubs e pela cultura celta, Dublin é perfeita para uma aventura solo. Confira dicas essenciais para uma jornada tranquila, como escolher hostels seguros e planejar seu roteiro.
✔️ Salve essas dicas e curta sua viagem com confiança.
Planeje sua aventura pelo WhatsApp: (99) 9 9999-9999
#DicasDeSegurança #ViajarSozinho #ViagemSegura' WHERE title = 'Dublin';
UPDATE public.content_items SET description = 'Aproveite dias incríveis no Egito! 🏜️✨ Conheça as Pirâmides de Gizé e o Rio Nilo com nosso pacote para 2 adultos, que inclui ✈️ passagens, 🏨 hospedagem e passeios guiados, a partir de 10x de R$150,00.
✔️ Uma viagem histórica cheia de descanso e descobertas.
Garanta sua vaga pelo WhatsApp: (99) 9 9999-9999
#ExcursãoEgito #ÚltimasVagas #FériasPerfeitas', drive_url = 'https://drive.google.com/file/d/12JM1Bxbqx7UPxIVdRLHNBIApQLJAyIIp/view?usp=drive_link' WHERE title = 'Egito';
UPDATE public.content_items SET description = 'Faça uma viagem rápida e econômica para as Filipinas! 🏖️✈️ Conhecidas pelas praias de Boracay e Palawan, as Filipinas são um destino dos sonhos. Nosso pacote inclui ✈️ passagens aéreas de ida e volta de São Paulo, por apenas R$520,00.
✔️ Conforto e tranquilidade para explorar esse paraíso asiático.
Garanta sua passagem pelo WhatsApp: (99) 9 9999-9999
#ViagemEconomica #PassagensAéreas #Filipinas', drive_url = 'https://drive.google.com/file/d/12XPKOUI1PYH1Wv9QRFcZ5DjWrrNx_5Bc/view?usp=drive_link' WHERE title = 'Filipinas';
UPDATE public.content_items SET description = 'Viaje para Fort Lauderdale com conforto! 🏖️✈️ Leve travesseiro de pescoço, vista roupas leves e hidrate-se durante o voo para aproveitar ao máximo. Conhecida como a "Veneza da América", Fort Lauderdale tem canais e praias lindas.
✔️ Dicas para um voo tranquilo e uma viagem inesquecível.
Planeje pelo WhatsApp: (99) 9 9999-9999
#DicasDeViagem #ConfortoNosVoos #VooConfortável', drive_url = 'https://drive.google.com/file/d/11lI17jUd0UAEegy80UKB6rCu2mynLkc1/view?usp=drive_link' WHERE title = 'Fort Lauderdale';
UPDATE public.content_items SET description = 'Planeje sua viagem dos sonhos para a Grécia! 🏛️✨ Com ilhas como Santorini e Mykonos, a Grécia é perfeita para quem ama história e praias. Nossos pacotes personalizados incluem ✈️ passagens, 🏨 hospedagem e passeios, com parcelamento em até 12x.
✔️ Um destino incrível para relaxar e explorar.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#ExplorarOMundo #PacotesDeViagem #FériasPerfeitas', drive_url = 'https://drive.google.com/file/d/12w7XtopwQlCFeq5dAVx8b_6YTPkGVru_/view?usp=drive_link' WHERE title = 'Grécia';
UPDATE public.content_items SET description = 'Evite erros ao planejar sua viagem para Israel! 🏛️✈️ Conhecido pela história de Jerusalém e pelo Mar Morto, Israel é um destino único. Confira dicas para uma jornada sem dores de cabeça, com ✈️ passagens e 🏨 hospedagem organizadas por nós.
✔️ Viaje com mais segurança e aproveite cada momento.
Planeje pelo WhatsApp: (99) 9 9999-9999
#DicasDeViagem #ViagemInternacional #ViajarSemEstresse', drive_url = 'https://drive.google.com/file/d/13YP7q3sD2sUsdzothWCmbhFmfK1X8U7A/view?usp=drive_link' WHERE title = 'Israel';
UPDATE public.content_items SET description = 'Planeje sua primeira aventura como mochileiro em Jordânia! 🏜️🧳 Conhecida por Petra e pelo deserto de Wadi Rum, Jordânia é um destino épico. Dicas como levar uma mochila leve e reservar passeios guiados garantem uma viagem sem estresse.
✔️ Um guia essencial para começar sua jornada.
Salve e planeje pelo WhatsApp: (99) 9 9999-9999
#MochileirosDePrimeiraViagem #DicasDeMochileiro #AventuraPeloMundo', drive_url = 'https://drive.google.com/file/d/13FoBEspFXJhDTEuWzIRX3sC3h3kXmmZE/view?usp=drive_link' WHERE title = 'Jordânia';
UPDATE public.content_items SET description = 'Viajar para Lima é colecionar momentos inesquecíveis! 🍽️✨ Conhecida pela gastronomia premiada e pelo centro histórico, Lima é um destino vibrante. Nossos pacotes oferecem ✈️ passagens e 🏨 hospedagem para você viver uma experiência cultural única.
✔️ Invista em memórias que valem mais que qualquer coisa.
Planeje pelo WhatsApp: (99) 9 9999-9999
#ViajarÉInvestir #FériasPerfeitas #MomentosInesquecíveis', drive_url = 'https://drive.google.com/file/d/16zxunOAHFxDW6fk8Ik2zo5-hOTWPq3dz/view?usp=drive_link' WHERE title = 'Lima';
UPDATE public.content_items SET description = 'Viaje de avião para Machu Picchu pela primeira vez! 🏔️✈️ Chegue cedo ao aeroporto, siga as regras de bagagem e relaxe durante o voo. Machu Picchu é uma das 7 Maravilhas do Mundo, com ruínas incas que vão te encantar.
✔️ Dicas para curtir a experiência e explorar esse destino histórico.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#PrimeiraViagem #DicasDeViagem #ViajarDeAvião' WHERE title = 'Machu Picchu';
UPDATE public.content_items SET description = 'Reduza o estresse nas Maldivas! 🏝️✨ Com bangalôs sobre o mar e águas cristalinas, esse destino é perfeito para relaxar. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem, para você desconectar e conhecer a cultura local.
✔️ Uma viagem para renovar as energias e se encantar.
Planeje agora pelo WhatsApp: (99) 9 9999-9999
#ViajarÉViver #ReduçãoDoEstresse #ExplorandoNovasCulturas', drive_url = 'https://drive.google.com/file/d/1KgDLZBTbhtxKBwmPHCwdsMtknBv3O3JQ/view?usp=drive_link' WHERE title = 'Maldivas';
UPDATE public.content_items SET description = 'Proporcione uma experiência mágica em Montevidéu! 🏙️✨ A capital uruguaia tem um charme único, com a Rambla, o Mercado del Puerto e o centro histórico. Nosso pacote em até 12x sem juros inclui ✈️ passagens, 🏨 hospedagem e passeios para conhecer a cidade.
✔️ Viva momentos únicos nesse destino sul-americano.
Garanta seu pacote pelo WhatsApp: (99) 9 9999-9999
#Montevidéu #FériasInternacionais #MagiaDaViagem' WHERE title = 'Montevidéu';
UPDATE public.content_items SET description = 'Celebre o Dia do Turista em Namíbia! 🏜️📸 Explore desertos como o Namib, safáris com elefantes e a cultura local única. Nossos pacotes oferecem ✈️ passagens e 🏨 hospedagem para você viver aventuras inesquecíveis nesse destino africano.
✔️ O mundo é cheio de descobertas para viajantes apaixonados.
Planeje sua viagem pelo WhatsApp: (99) 9 9999-9999
#DiaDoTurista #ExplorarOMundo #FériasInesquecíveis' WHERE title = 'Namíbia';
UPDATE public.content_items SET description = 'Desconecte-se em New York! 🏙️✨ A Big Apple tem atrações como a Times Square, o Central Park e a Estátua da Liberdade. Nosso pacote especial inclui 5 noites para 2 adultos, ✈️ passagens aéreas e traslados, por 10x de R$450,00.
✔️ Um destino vibrante para viver momentos inesquecíveis.
Reserve agora pelo WhatsApp: (99) 9 9999-9999
#NewYork #DestinoDosSonhos #FériasPerfeitas' WHERE title = 'New York';
UPDATE public.content_items SET description = 'Encante-se com a Nova Zelândia! 🏔️✨ Com paisagens de tirar o fôlego, como os fiordes de Milford Sound e as locações de "O Senhor dos Anéis", esse destino é um sonho. Nosso pacote em até 10x de R$850,00 inclui ✈️ passagens e 🏨 hospedagem.
✔️ Uma viagem para explorar a natureza e a cultura Maori.
Garanta sua viagem pelo WhatsApp: (99) 9 9999-9999
#NovaZelândia #PacotesDeViagem #FériasNaNatureza' WHERE title = 'Nova Zelândia';
UPDATE public.content_items SET description = 'Relaxe em Orlando com nossos pacotes perfeitos! 🎢✨ Conhecida pelos parques da Disney e Universal, Orlando é ideal para famílias e amantes de diversão. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e ingressos, com parcelamento no boleto.
✔️ Um destino mágico para criar memórias inesquecíveis.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#PlanejeSuasFérias #PacotesImperdíveis #FériasDosSonhos' WHERE title = 'Orlando';
UPDATE public.content_items SET description = 'Viaje sozinho para Paris com segurança! 🗼✨ Conhecida pela Torre Eiffel e pelos cafés, Paris é perfeita para uma aventura solo. Confira dicas essenciais para uma jornada tranquila, como escolher hotéis seguros e planejar seu roteiro.
✔️ Salve essas dicas e curta sua viagem com confiança.
Planeje sua aventura pelo WhatsApp: (99) 9 9999-9999
#DicasDeSegurança #ViajarSozinho #ViagemSegura' WHERE title = 'Paris';
UPDATE public.content_items SET description = 'Suas férias estão chegando, e Phi Phi te espera! 🏝️✨ Conhecida pelas águas cristalinas e falésias, Phi Phi é um paraíso na Tailândia. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios de barco para explorar as ilhas, tudo organizado para você.
✔️ Não deixe para última hora e garanta uma viagem perfeita.
Fale agora pelo WhatsApp: (99) 9 9999-9999
#PlanejeSuasFérias #ViagemSemEstresse #FériasPerfeitas', drive_url = 'https://drive.google.com/file/d/1715AG9DS8x04gPYkyagsNRpZpBVf5b52/view?usp=drive_link' WHERE title = 'Phi Phi';
UPDATE public.content_items SET description = 'Descubra Pisa e viva experiências únicas! 🏛️✨ Conhecida pela Torre Inclinada e pela Piazza dei Miracoli, Pisa é um destino cheio de história. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar a cidade e arredores, como Florença.
✔️ Uma viagem para se encantar com a Itália.
Entre em contato pelo WhatsApp: (99) 9 9999-9999
#ViajarÉViver #MagiaDosDestinos #FériasInesquecíveis' WHERE title = 'Pisa';
UPDATE public.content_items SET description = 'Descubra Praga com pacotes exclusivos! 🏰✨ Conhecida pela Ponte Carlos e pelo Castelo de Praga, essa cidade é um conto de fadas. Nossos pacotes oferecem ✈️ passagens, 🏨 hospedagem e passeios, com preços acessíveis e suporte completo.
✔️ Condições facilitadas para todos os perfis de viajantes.
Planeje sua viagem pelo WhatsApp: (99) 9 9999-9999
#DescubraOMundo #ViajeComEstilo #AgenciaDeViagens', drive_url = 'https://drive.google.com/file/d/173n8iP4v75kIDj_NPucHRP4oOUXPKwZa/view?usp=drive_link' WHERE title = 'Praga';
UPDATE public.content_items SET description = 'Está na hora de planejar suas férias dos sonhos em Punta Cana! 🏖️✨ Com resorts all-inclusive e praias de areia branca, esse destino é perfeito para relaxar. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e traslados, por 10x de R$450,00.
✔️ Um paraíso caribenho para descansar e se divertir.
Garanta seu pacote pelo WhatsApp: (99) 9 9999-9999
#ViajarÉViver #PuntaCanaDream #AgenciaDeViagens' WHERE title = 'Punta Cana';
UPDATE public.content_items SET description = 'Escolha o destino perfeito para Salar de Uyuni! 🏜️📸 O maior deserto de sal do mundo é ideal para fotos incríveis e paisagens surreais. Nossa equipe te ajuda a planejar a viagem dos sonhos, com ✈️ passagens e 🏨 hospedagem inclusas.
✔️ Um lugar para relaxar, explorar ou se aventurar.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#DestinoIdeal #PlanejeSuaViagem #FériasDosSonhos', drive_url = 'https://drive.google.com/file/d/14lfWkvHalF4KKFP1YEYrVok_NJgr7Rbf/view?usp=drive_link' WHERE title = 'Salar de Uyuni';
UPDATE public.content_items SET description = 'Embarque em um cruzeiro completo por São Francisco! 🚤✨ Navegue pela Baía de São Francisco, com vista para a Golden Gate, e desfrute de gastronomia e atividades a bordo. Nosso pacote inclui tudo: alimentação, passeios e hospedagem, com parcelamento facilitado.
✔️ Uma experiência única para explorar a costa da Califórnia.
Reserve pelo WhatsApp: (99) 9 9999-9999
#CruzeiroDosSonhos #EmbarqueJá #FériasInesquecíveis' WHERE title = 'São Francisco';
UPDATE public.content_items SET description = 'Sonha com Singapura? 🏙️✨ Conhecida pela modernidade de Marina Bay Sands e pelos Gardens by the Bay, Singapura é um destino futurista. Nosso pacote a partir de R$5.000 inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar a cidade.
✔️ Uma experiência de tranquilidade e beleza urbana.
Garanta sua viagem pelo WhatsApp: (99) 9 9999-9999
#Singapura #DestinoDosSonhos #FériasNoParaíso' WHERE title = 'Singapura';
UPDATE public.content_items SET description = '✨ A aventura te espera com Suiça! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#Suiça #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Suiça';
UPDATE public.content_items SET description = 'Cada aventura em Taiwan faz parte de quem somos! 🏯📸 Conhecida pela modernidade de Taipei e pela cultura tradicional, Taiwan é um destino fascinante. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para você criar histórias inesquecíveis.
✔️ Viva experiências únicas nesse destino asiático.
Planeje agora pelo WhatsApp: (99) 9 9999-9999
#ViajarÉViver #MemóriasInesquecíveis #AventuraEDescoberta' WHERE title = 'Taiwan';
UPDATE public.content_items SET description = 'Saia da rotina em Ushuaia! ❄️✈️ Conhecida como o "Fim do Mundo", Ushuaia é perfeita para quem ama frio e paisagens glaciais. Nossos pacotes a partir de 10x de R$150,00 incluem ✈️ passagens, 🏨 hospedagem e passeios como o Trem do Fim do Mundo.
✔️ Um destino único para sua próxima aventura.
Planeje agora pelo WhatsApp: (99) 9 9999-9999
#NovosDestinos #PacotesDeViagem #ExplorarOMundo' WHERE title = 'Ushuaia';
UPDATE public.content_items SET description = 'Viaje para Washington com segurança! 🏛️✈️ Pesquise sobre o destino, use serviços oficiais como táxis credenciados e evite sacar grandes quantias de dinheiro. Washington tem museus incríveis e monumentos como o Lincoln Memorial.
✔️ Dicas para uma viagem tranquila e sem golpes.
Planeje pelo WhatsApp: (99) 9 9999-9999
#DicasDeViagem #GolpesContraTuristas #ViagemSegura' WHERE title = 'Washington';
UPDATE public.content_items SET description = 'Evite surpresas no aeroporto ao viajar para Amsterdã! 🧳✈️ Confira dicas para não ter problemas com excesso de bagagem e curta os canais, os museus como o Van Gogh e as tulipas holandesas. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem.
✔️ Viaje tranquilo e aproveite cada momento sem estresse.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#DicasDeViagem #ExcessoDeBagagem #ViagemSemEstresse', drive_url = 'https://drive.google.com/file/d/14lt3EasFTVCE_WbRidGQxemKoMIb8G9-/view?usp=drive_link' WHERE title = 'Amsterdã';
UPDATE public.content_items SET description = 'Evite surpresas no aeroporto ao viajar para Amsterdã! 🧳✈️ Confira dicas para não ter problemas com excesso de bagagem e curta os canais, os museus como o Van Gogh e as tulipas holandesas. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem.
✔️ Viaje tranquilo e aproveite cada momento sem estresse.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#DicasDeViagem #ExcessoDeBagagem #ViagemSemEstresse', drive_url = 'https://drive.google.com/file/d/14lt3EasFTVCE_WbRidGQxemKoMIb8G9-/view?usp=drive_link' WHERE title = 'Amsterdã 2';
UPDATE public.content_items SET description = 'Proporcione uma experiência mágica em Atenas! 🏛️✨ Conhecida pela Acrópole e pela história grega, Atenas é um destino fascinante. Nosso pacote em até 12x sem juros inclui ✈️ passagens, 🏨 hospedagem e passeios para conhecer a cidade.
✔️ Viva momentos únicos nesse destino histórico.
Garanta seu pacote pelo WhatsApp: (99) 9 9999-9999
#Atenas #FériasInternacionais #MagiaDaViagem', drive_url = 'https://drive.google.com/file/d/14UQcXCy5m5KruQryEqeR-S2Y36bPUYVa/view?usp=drive_link' WHERE title = 'Atenas';
UPDATE public.content_items SET description = 'Desbrave Bali com pacotes a partir de R$9.500! 🏝️✨ Com templos como Uluwatu e praias paradisíacas, Bali é um destino internacional incrível. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para conhecer a cultura balinesa.
✔️ Uma viagem para relaxar e se conectar com a natureza.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#ExploreOMundo #PacotesInternacionais #FériasIncríveis', drive_url = 'https://drive.google.com/file/d/13nE_5UouaL2uuX6KwnjFyzjd3X3wY_EU/view?usp=drive_link' WHERE title = 'Bali';
UPDATE public.content_items SET description = 'Sonha com Bangkok? 🏯✨ Conhecida pelos templos como o Wat Arun e pelos mercados flutuantes, Bangkok é um destino vibrante. Nosso pacote a partir de R$2.500 inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar a cidade.
✔️ Um destino para explorar a cultura tailandesa.
Garanta sua vaga pelo WhatsApp: (99) 9 9999-9999
#Bangkok #DestinoDosSonhos #FériasIncríveis', drive_url = 'https://drive.google.com/file/d/17ZxvJqdPt4WGuosoyOQF2MK2lWqbL7BS/view?usp=drive_link' WHERE title = 'Bangkok';
UPDATE public.content_items SET description = 'Celebre o Dia do Turista em Barcelona! 🏛️✨ Explore a Sagrada Família e o Parc Güell com nossos pacotes que oferecem ✈️ passagens e 🏨 hospedagem. Barcelona é perfeita para quem ama arquitetura e cultura catalã.
✔️ O mundo é cheio de descobertas para viajantes apaixonados.
Planeje sua viagem pelo WhatsApp: (99) 9 9999-9999
#DiaDoTurista #ExplorarOMundo #FériasInesquecíveis', drive_url = 'https://drive.google.com/file/d/14UiSdexiKw5YFaymTv8RlNIhYLNz83Ow/view?usp=drive_link' WHERE title = 'Barcelona';
UPDATE public.content_items SET description = 'Relembre momentos incríveis em Berlim! 🏛️✨ Conhecida pelo Muro de Berlim e pela vida noturna vibrante, Berlim é um destino cheio de história. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem para você planejar sua próxima viagem dos sonhos.
✔️ Um destino com cultura e modernidade para se apaixonar.
Descubra mais pelo WhatsApp: (99) 9 9999-9999
#Berlim #TBTDeViagem #DestinoIncrível', drive_url = 'https://drive.google.com/file/d/16tvUY6Yl9nLoRsOaYiZU9gzr_hK-STiJ/view?usp=drive_link' WHERE title = 'Berlim';
UPDATE public.content_items SET description = 'Crie memórias inesquecíveis em Buenos Aires! 🕺✨ Conhecida pelo tango e pela gastronomia, como o bife de chorizo, Buenos Aires é um destino vibrante. Nossos pacotes oferecem ✈️ passagens e 🏨 hospedagem para você viver momentos únicos.
✔️ Viajar é a melhor forma de colecionar experiências.
Planeje sua viagem pelo WhatsApp: (99) 9 9999-9999
#ColecioneMemórias #ExperiênciasInesquecíveis #FériasDosSonhos', drive_url = 'https://drive.google.com/file/d/11_83xtMwYDS_E15nSddFC-nddLwVXzwr/view?usp=drive_link' WHERE title = 'Buenos Aires';
UPDATE public.content_items SET description = 'Planeje sua viagem para Cartagena com antecedência! 🏖️✨ Para garantir as melhores ofertas em passagens e hospedagem, programe-se com 3 a 6 meses. Cartagena é famosa pela cidade murada e pelas praias caribenhas.
✔️ Economize e evite imprevistos para uma viagem perfeita.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#DicasDeViagem #PlanejamentoDeViagem #FériasPerfeitas', drive_url = 'https://drive.google.com/file/d/11P9THfMnqi8jdhN5B1FLVCzYJj4Szx5I/view?usp=drive_link' WHERE title = 'Cartagena';
UPDATE public.content_items SET description = 'Descubra as maravilhas de Dubai! 🏙️✨ Com o Burj Khalifa e os shoppings de luxo, Dubai é um destino moderno e fascinante. Nosso pacote a partir de 10x de R$450,00 inclui ✈️ passagens, 🏨 hospedagem e passeios para conhecer o deserto e a cidade.
✔️ Um destino internacional cheio de glamour te espera.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#BelezasDeDubai #ViajarPeloMundo #FériasInternacionais', drive_url = 'https://drive.google.com/file/d/13BCK3_0ZhbK0Ogenc8bAydyOObsUcmlG/view?usp=drive_link' WHERE title = 'Dubai';
UPDATE public.content_items SET description = 'Saia da rotina em Florença! 🏛️✨ Conhecida pela Duomo e pela arte renascentista, Florença é um destino cultural. Nossos pacotes a partir de 10x de R$150,00 incluem ✈️ passagens, 🏨 hospedagem e passeios para explorar a Toscana.
✔️ Um destino único para sua próxima aventura.
Planeje agora pelo WhatsApp: (99) 9 9999-9999
#NovosDestinos #PacotesDeViagem #ExplorarOMundo', drive_url = 'https://drive.google.com/file/d/14ZnngFhqqtTeXoAvWqyNDhansf_oW0DB/view?usp=drive_link' WHERE title = 'Florença';
UPDATE public.content_items SET description = 'Busca conforto em Frankfurt? 🏙️✨ Nosso pacote para a cidade alemã inclui café da manhã delicioso, Wi-Fi, TV e estacionamento, a partir de 10x de R$450,00. Explore o Römer e o Rio Meno com total comodidade.
✔️ Tudo pensado para você relaxar e aproveitar ao máximo.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#PacotesCompletos #ViajarComConforto #BenefíciosExclusivos' WHERE title = 'Frankfurt';
UPDATE public.content_items SET description = 'Cada viagem para Havana é um novo capítulo na sua vida! 🎶✨ Conhecida pela música, pelos carros antigos e pela história, Havana é um destino vibrante. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem para você criar memórias inesquecíveis.
✔️ Uma aventura única na capital cubana te espera.
Planeje agora pelo WhatsApp: (99) 9 9999-9999
#NovaHistória #FériasIncríveis #ColecioneMomentos', drive_url = 'https://drive.google.com/file/d/14mzIawQF4E5QhAeinx1QAr_v5XORXwQm/view?usp=drive_link' WHERE title = 'Havana';
UPDATE public.content_items SET description = 'Cada viagem para Havana é um novo capítulo na sua vida! 🎶✨ Conhecida pela música, pelos carros antigos e pela história, Havana é um destino vibrante. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem para você criar memórias inesquecíveis.
✔️ Uma aventura única na capital cubana te espera.
Planeje agora pelo WhatsApp: (99) 9 9999-9999
#NovaHistória #FériasIncríveis #ColecioneMomentos', drive_url = 'https://drive.google.com/file/d/14mzIawQF4E5QhAeinx1QAr_v5XORXwQm/view?usp=drive_link' WHERE title = 'Havana 2';
UPDATE public.content_items SET description = 'Faça uma viagem rápida e econômica para Hong Kong! 🏙️✈️ Conhecida pelo skyline e pelos mercados noturnos, Hong Kong é um destino vibrante. Nosso pacote inclui ✈️ passagens aéreas de ida e volta de São Paulo, por apenas R$520,00.
✔️ Conforto e tranquilidade para explorar esse destino asiático.
Garanta sua passagem pelo WhatsApp: (99) 9 9999-9999
#ViagemEconomica #PassagensAéreas #HongKong', drive_url = 'https://drive.google.com/file/d/11P5Qs2gbTDatiGJC6bdGJAoGEqMR6hxQ/view?usp=drive_link' WHERE title = 'Hong Kong';
UPDATE public.content_items SET description = 'Invista em experiências na Ilha de Páscoa! 🗿✨ Conhecida pelos moais e pela cultura Rapa Nui, esse destino é único. Cada viagem traz aprendizados e memórias, e nosso pacote inclui ✈️ passagens e 🏨 hospedagem para você explorar a ilha.
✔️ Fique rico em histórias para contar por toda a vida.
Planeje pelo WhatsApp: (99) 9 9999-9999
#LembreteDeViagem #ExperiênciasIncríveis #ColecioneMomentos', drive_url = 'https://drive.google.com/file/d/13xncXj0kYKHhA7CwZmMODnuUplNm8CHj/view?usp=drive_link' WHERE title = 'Ilha de Páscoa';
UPDATE public.content_items SET description = 'Curta o calor em 3 paraísos: Istambul, Dubai e Phuket! 🌍✨ Istambul tem o Grand Bazaar e a Mesquita Azul, perfeitos para o verão. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para você escolher seu destino favorito.
✔️ Três opções internacionais para suas férias.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#DestinosDeVerão #ViajarÉViver', drive_url = 'https://drive.google.com/file/d/11XeR8mUA74-_PVfdF01d2Hr3wELdrqFZ/view?usp=drive_link' WHERE title = 'Istambul';
UPDATE public.content_items SET description = 'Passaporte vencido antes de ir para Itália? 🛂✈️ Não se preocupe! Saiba como resolver rapidamente: renove com antecedência e verifique as exigências do destino. Itália tem Roma, Veneza e a Costa Amalfitana, destinos imperdíveis.
✔️ Planeje com antecedência e evite problemas no embarque.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#PassaporteVencido #DicasDeViagem #PlanejamentoDeViagem', drive_url = 'https://drive.google.com/file/d/123DM5h9VObNWH2PC7sMw9RfpNQb2j0tE/view?usp=drive_link' WHERE title = 'Itália';
UPDATE public.content_items SET description = 'Aproveite dias incríveis em Las Vegas! 🎰✨ Conhecida pelos cassinos e shows, Las Vegas é pura diversão. Nosso pacote para 2 adultos inclui ✈️ passagens, 🏨 hospedagem e passeios, a partir de 10x de R$150,00.
✔️ Uma viagem cheia de entretenimento e glamour.
Garanta sua vaga pelo WhatsApp: (99) 9 9999-9999
#ExcursãoLasVegas #ÚltimasVagas #FériasPerfeitas', drive_url = 'https://drive.google.com/file/d/1395jEwtwNqIFjDehC9zhGCY-xZdsDf8u/view?usp=drive_link' WHERE title = 'Las Vegas';
UPDATE public.content_items SET description = 'Sonha com neve em Lisboa? ❄️✨ Embora Lisboa seja mais conhecida pelo clima ameno, você pode curtir destinos nevados como Zermatt, Valle Nevado e Bariloche. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para um inverno mágico.
✔️ Escolha seu destino gelado e viva o frio com estilo.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#DestinosDeNeve #ViagemDeInverno #Lisboa' WHERE title = 'Lisboa';
UPDATE public.content_items SET description = 'Planeje sua viagem para Londres pelo nosso site! 🏰✈️ Rápido, seguro e com ofertas exclusivas, nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para o Big Ben, o London Eye e o Palácio de Buckingham.
✔️ Tudo pronto para sua próxima aventura em poucos cliques.
Acesse pelo WhatsApp: (99) 9 9999-9999
#CompreOnline #PacotesDeViagem #FériasDosSonhos' WHERE title = 'Londres';
UPDATE public.content_items SET description = 'Encante-se com Los Angeles! 🌟✨ Com a Calçada da Fama e as praias de Santa Monica, LA é um destino dos sonhos. Nosso pacote em até 10x de R$850,00 inclui ✈️ passagens e 🏨 hospedagem para você explorar Hollywood e muito mais.
✔️ Uma viagem para explorar a cultura americana.
Garanta sua viagem pelo WhatsApp: (99) 9 9999-9999
#LosAngeles #PacotesDeViagem #FériasNaCali 
Tokyo
Cada aventura em Tokyo faz parte de quem somos! 🏯✨ Conhecida pela modernidade de Shibuya e pela tradição de Asakusa, Tokyo é fascinante. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para você criar histórias inesquecíveis.
✔️ Viva experiências únicas nesse destino japonês.
Planeje agora pelo WhatsApp: (99) 9 9999-9999
#ViajarÉViver #MemóriasInesquecíveis #AventuraEDescoberta' WHERE title = 'Los Angeles';
UPDATE public.content_items SET description = 'Prepare-se para Madri! 🏛️✈️ Leve um adaptador universal, contrate um seguro viagem e verifique passaporte 🛂 e visto para evitar imprevistos. Madri tem o Palácio Real e a Plaza Mayor, perfeitos para explorar a cultura espanhola.
✔️ Itens essenciais para curtir a capital espanhola sem preocupações.
Planeje pelo WhatsApp: (99) 9 9999-9999
#DicasDeViagem #ViagemInternacional #FériasPerfeitas', drive_url = 'https://drive.google.com/file/d/11KUUHXnZ6hUOhB1ralJnU_Z0KUT-Flkh/view?usp=drive_link' WHERE title = 'Madri';
UPDATE public.content_items SET description = 'Prepare-se para Miami! 🏖️🧳 Saiba como agir se sua bagagem for extraviada: informe a companhia aérea, tenha o comprovante de despacho e contrate um seguro viagem. Miami tem South Beach e a vibe latina de Little Havana.
✔️ Dicas para resolver imprevistos e curtir sua viagem.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#DicasDeViagem #BagagemExtraviada #ViagemSemEstresse' WHERE title = 'Miami';
UPDATE public.content_items SET description = 'Explore Milão com conforto! 🏛️✨ Conhecida pela Duomo e pela moda, Milão é um destino elegante. Nosso pacote inclui 5 diárias, ✈️ passagens de ida e volta, transfer do aeroporto ao hotel e passeios exclusivos, por apenas R$1.500 por pessoa.
✔️ Uma viagem para relaxar e explorar a Itália.
Garanta sua viagem pelo WhatsApp: (99) 9 9999-9999
#DescubraMilão #PacotesDeViagem #FériasInesquecíveis' WHERE title = 'Milão';
UPDATE public.content_items SET description = 'Explore novos horizontes em Munique! 🍻✨ Conhecida pela Oktoberfest e pelo Englischer Garten, Munique é perfeita para quem ama cultura e cerveja. Nossos pacotes especiais incluem ✈️ passagens, 🏨 hospedagem e passeios, com condições facilitadas.
✔️ Um destino europeu para sua próxima aventura.
Planeje pelo WhatsApp: (99) 9 9999-9999
#ExploreOMundo #PacoteDeViagem #ViagemSemComplicações' WHERE title = 'Munique';
UPDATE public.content_items SET description = 'Cada passo da sua viagem para Phuket é memorável! 🏖️✨ Conhecida pelas praias de Patong e pelas ilhas próximas, Phuket é um paraíso tailandês. Nosso pacote oferece ✈️ passagens, 🏨 hospedagem e passeios de barco para curtir cada detalhe.
✔️ A aventura está em cada parada dessa jornada incrível.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#JornadaDeViagem #FériasIncríveis #ExperiênciasInesquecíveis' WHERE title = 'Phuket';
UPDATE public.content_items SET description = 'Não deixe seus sonhos de viagem para Playa del Carmen para depois! 🏖️✨ Com praias caribenhas e a Quinta Avenida, Playa é um destino vibrante. Nossos pacotes personalizados incluem ✈️ passagens, 🏨 hospedagem e passeios, com facilidade no pagamento.
✔️ Ofertas especiais para você explorar esse paraíso mexicano.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#ViajeMaisVivaMais #PacotesDeViagem #FériasDosSonhos' WHERE title = 'Playa Del Carmen';
UPDATE public.content_items SET description = 'Curta dias de sol na Riviera Maya! 🏖️✨ Com cenotes e ruínas maias como Chichén Itzá, esse destino é um paraíso. Nossos pacotes especiais incluem ✈️ passagens, 🏨 hospedagem e passeios, com facilidade de pagamento para sua viagem.
✔️ Uma aventura inesquecível te espera no México.
Garanta sua vaga pelo WhatsApp: (99) 9 9999-9999
#PartiuRivieraMaya #ViagemDosSonhos #FériasIncríveis 
Conteúdos Internacionais ✈️' WHERE title = 'Riviera Maya';
UPDATE public.content_items SET description = 'Evite imprevistos em Roma! 🏛️✈️ Chegue cedo ao aeroporto e mantenha seus documentos como passaporte 🛂 à mão para uma viagem tranquila. Roma é famosa pelo Coliseu e pela culinária italiana, como a carbonara autêntica.
✔️ Dicas para curtir a Cidade Eterna sem estresse.
Planeje pelo WhatsApp: (99) 9 9999-9999
#DicasDeViagem #ViajarSemEstresse #PlanejamentoDeViagem' WHERE title = 'Roma';
UPDATE public.content_items SET description = 'Santiago te espera para uma viagem inesquecível! 🏔️✨ Reúna a galera e curta a cultura chilena, com vinícolas e o centro histórico. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar a cidade e arredores, como o Valle Nevado.
✔️ Uma experiência perfeita para grupos de amigos ou família.
Planeje agora pelo WhatsApp: (99) 9 9999-9999
#BoraPraSantiago #ViagemComAmigos #FériasNaCidade' WHERE title = 'Santiago';
UPDATE public.content_items SET description = 'Santiago te espera para uma viagem inesquecível! 🏔️✨ Reúna a galera e curta a cultura chilena, com vinícolas e o centro histórico. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar a cidade e arredores, como o Valle Nevado.
✔️ Uma experiência perfeita para grupos de amigos ou família.
Planeje agora pelo WhatsApp: (99) 9 9999-9999
#BoraPraSantiago #ViagemComAmigos #FériasNaCidade' WHERE title = 'Santiago 2';
UPDATE public.content_items SET description = 'Deixe tudo por nossa conta em Siena! 🏛️✈️ Conhecida pela Piazza del Campo e pela arquitetura medieval, Siena é um destino encantador na Toscana. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar a região.
✔️ Viaje sem preocupações e viva a magia italiana.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#AgenciaDeViagens #PacotesDeViagem #ViajarÉViver' WHERE title = 'Siena';
UPDATE public.content_items SET description = 'Não perca seu voo para Sydney! ✈️🛂 Chegue com antecedência ao aeroporto, faça o check-in online e configure alarmes no celular para o horário de embarque. Sydney tem a Opera House e Bondi Beach, perfeitas para explorar.
✔️ Dicas para uma viagem tranquila e sem correrias.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#DicasDeViagem #NaoPercaSeuVoo #ViagemSemEstresse' WHERE title = 'Sydney';
UPDATE public.content_items SET description = '✨ A aventura te espera com Tokyo! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#Tokyo #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Tokyo';
UPDATE public.content_items SET description = 'Aproveite o tempo no aeroporto antes de ir para Toronto! ✈️🧳 Explore lojas, leia um livro ou descanse em áreas tranquilas para recarregar as energias. Toronto tem atrações como a CN Tower e o Distillery District, perfeitas para sua viagem.
✔️ Dicas para tornar sua espera mais produtiva e agradável.
Planeje sua viagem pelo WhatsApp: (99) 9 9999-9999
#ConexãoDeVoo #DicasDeViagem #TempoDeEspera' WHERE title = 'Toronto';
UPDATE public.content_items SET description = '✨ A aventura te espera com Tulum! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#Tulum #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Tulum';
UPDATE public.content_items SET description = 'Viaje para Vancouver com segurança! 🏔️✈️ Pesquise sobre o destino, use serviços oficiais como táxis credenciados e evite sacar grandes quantias de dinheiro. Vancouver tem o Stanley Park e montanhas incríveis para explorar.
✔️ Dicas para uma viagem tranquila e sem golpes.
Planeje pelo WhatsApp: (99) 9 9999-9999
#DicasDeViagem #GolpesContraTuristas #ViagemSegura' WHERE title = 'Vancouver';
UPDATE public.content_items SET description = 'Viaje em família para Veneza! 🚤✨ Conhecida pelos canais e pela Praça de São Marcos, Veneza é mágica para crianças e adultos. Outras opções incríveis incluem Paris, Orlando e Lisboa, com pacotes que incluem ✈️ passagens e 🏨 hospedagem.
✔️ Momentos inesquecíveis para todas as idades garantidos.
Planeje agora pelo WhatsApp: (99) 9 9999-9999
#ViagemComCrianças #FériasEmFamília #Veneza', drive_url = 'https://drive.google.com/file/d/14z2pfoMaPJaaYmorF3wri-7h0YT00rtD/view?usp=drive_link' WHERE title = 'Veneza';
UPDATE public.content_items SET description = '✨ A aventura te espera com 5 Praias Floripa! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#5PraiasFloripa #ViagemPerfeita #AgenciaDeViagens' WHERE title = '5 Praias Floripa';
UPDATE public.content_items SET description = 'Desbrave Alagoas com pacotes a partir de R$2.500! 🏖️🌊 Explore praias como São Miguel dos Milagres e Pajuçara, com suas águas mornas e cenários perfeitos para relaxar. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para conhecer o melhor da região.
✔️ Um destino nacional cheio de belezas para descobrir.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#ExploreOMundo #PacotesNacionais #FériasIncríveis 
Florianópolis
Cada viagem para Florianópolis é um novo capítulo na sua vida! 🏝️📸 Conhecida pelas praias e pela vibe descontraída, Floripa tem opções para todos os gostos, de surfe a trilhas. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem para você criar memórias inesquecíveis.
✔️ Uma aventura única na Ilha da Magia te espera.
Planeje agora pelo WhatsApp: (99) 9 9999-9999
#NovaHistória #FériasIncríveis #ColecioneMomentos' WHERE title = 'Alagoas';
UPDATE public.content_items SET description = 'Explore novos horizontes em Alter do Chão! 🏝️🌊 Conhecido como o "Caribe Amazônico", esse destino tem praias de água doce e uma vibe única. Nossos pacotes especiais incluem ✈️ passagens, 🏨 hospedagem e passeios de barco, com condições facilitadas de pagamento.
✔️ Um paraíso no coração da Amazônia para sua próxima aventura.
Planeje pelo WhatsApp: (99) 9 9999-9999
#ExploreOMundo #PacoteDeViagem #ViagemSemComplicações', drive_url = 'https://drive.google.com/file/d/1MbuUZT24JUU06g26z7tl_CdzVbseYbfO/view?usp=drive_link' WHERE title = 'Alter do Chão';
UPDATE public.content_items SET description = 'Embarque em um cruzeiro completo pela Amazônia! 🌿🚤 Desfrute de 5 dias navegando pelos rios, com gastronomia regional, atividades como trilhas e observação de botos, e paradas em comunidades locais. Nosso pacote inclui tudo: alimentação, passeios e hospedagem a bordo, com parcelamento facilitado.
✔️ Uma experiência única para se conectar com a natureza.
Reserve pelo WhatsApp: (99) 9 9999-9999
#CruzeiroDosSonhos #EmbarqueJá #FériasInesquecíveis' WHERE title = 'Amazônia';
UPDATE public.content_items SET description = 'Invista em experiências no Amazonas! 🌳✨ Conheça a Floresta Amazônica, navegue pelos rios e aprenda sobre a cultura indígena local. Cada destino traz aprendizados e memórias que valem mais que qualquer bem material, e nosso pacote inclui ✈️ passagens e 🏨 hospedagem.
✔️ Fique rico em histórias para contar por toda a vida.
Planeje pelo WhatsApp: (99) 9 9999-9999
#LembreteDeViagem #ExperiênciasIncríveis #ColecioneMomentos' WHERE title = 'Amazonas';
UPDATE public.content_items SET description = 'Explore as maravilhas de Angra dos Reis! ⛵🌊 Com ilhas paradisíacas como Ilha Grande e Lopes Mendes, esse destino é perfeito para quem ama o mar. Nosso pacote a partir de 10x de R$250,00 inclui ✈️ passagens, 🏨 hospedagem e passeios de barco.
✔️ Um roteiro cheio de praias e natureza para suas férias.
Garanta sua viagem pelo WhatsApp: (99) 9 9999-9999
#PasseiosAngra #PraiasDoRJ #FériasPerfeitas 
5 Praias Floripa
Prepare-se para 5 Praias Floripa! 🏖️✈️ Leve um adaptador universal, contrate um seguro viagem e verifique passaporte 🛂 e identidade para evitar imprevistos. Florianópolis tem praias incríveis como Joaquina e Daniela, perfeitas para o verão.
✔️ Itens essenciais para curtir a Ilha da Magia sem preocupações.
Planeje pelo WhatsApp: (99) 9 9999-9999
#DicasDeViagem #ViagemNacional #FériasPerfeitas', drive_url = 'https://drive.google.com/file/d/11I4vws3kvAi3eVkdHX8drR3Lb2i6Hn0Q/view?usp=drive_link' WHERE title = 'Angra dos Reis';
UPDATE public.content_items SET description = 'Crie memórias inesquecíveis em Arraial do Cabo! 🏖️📸 Com praias como a Prainha e passeios de barco para a Praia do Farol, esse destino é um sonho para quem ama o mar. Nossos pacotes oferecem ✈️ passagens e 🏨 hospedagem para você viver momentos únicos.
✔️ Viajar é a melhor forma de colecionar experiências.
Planeje sua viagem pelo WhatsApp: (99) 9 9999-9999
#ColecioneMemórias #ExperiênciasInesquecíveis #FériasDosSonhos' WHERE title = 'Arraial do Cabo';
UPDATE public.content_items SET description = 'Sonha com Balneário Camboriú? 🏙️🏖️ Conhecida pelos arranha-céus e pela praia central, esse destino é perfeito para quem busca diversão e modernidade. Nosso pacote a partir de R$2.500 inclui ✈️ passagens, 🏨 hospedagem e passeios como o Parque Unipraias.
✔️ Um destino para curtir dias de sol e agito.
Garanta sua vaga pelo WhatsApp: (99) 9 9999-9999
#BalneárioCamboriú #DestinoDosSonhos #FériasIncríveis', drive_url = 'https://drive.google.com/file/d/16MLNHPAj0FHwPygFH8OUY0QSoDbWnTgc/view?usp=drive_link' WHERE title = 'Balneário Camboriú';
UPDATE public.content_items SET description = 'Planeje sua viagem para Fernando de Noronha sem preocupações! 🐠🏝️ Esse arquipélago é famoso pelas praias paradisíacas e vida marinha rica, ideal para mergulhos inesquecíveis. Nosso pacote completo inclui ✈️ passagens aéreas, 🏨 hospedagem em pousada charmosa e até opções de passeios para explorar a ilha, tudo em até 10x sem juros.
✔️ Suporte personalizado para você curtir cada momento.
Fale conosco pelo WhatsApp: (99) 9 9999-9999
#ViajarSemPreocupação #PacoteDeViagem #AgenciaDeViagens', drive_url = 'https://drive.google.com/file/d/10yEMLzRjLik8_3MM-Oz77oBJQWZODZHX/view?usp=drive_link' WHERE title = 'Fernando de Noronha';
UPDATE public.content_items SET description = 'Planeje sua viagem para Fernando de Noronha sem preocupações! 🐠🏝️ Esse arquipélago é famoso pelas praias paradisíacas e vida marinha rica, ideal para mergulhos inesquecíveis. Nosso pacote completo inclui ✈️ passagens aéreas, 🏨 hospedagem em pousada charmosa e até opções de passeios para explorar a ilha, tudo em até 10x sem juros.
✔️ Suporte personalizado para você curtir cada momento.
Fale conosco pelo WhatsApp: (99) 9 9999-9999
#ViajarSemPreocupação #PacoteDeViagem #AgenciaDeViagens', drive_url = 'https://drive.google.com/file/d/10yEMLzRjLik8_3MM-Oz77oBJQWZODZHX/view?usp=drive_link' WHERE title = 'Fernando de Noronha 2';
UPDATE public.content_items SET description = 'Relembre momentos incríveis em Florianópolis - SC! 🏖️🌅 Conhecida como a "Ilha da Magia", Floripa tem praias para todos os gostos, de Jurerê a Campeche. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem, para você planejar sua próxima viagem dos sonhos.
✔️ Um destino com paisagens de tirar o fôlego e muita diversão.
Descubra mais pelo WhatsApp: (99) 9 9999-9999
#Florianópolis #TBTDeViagem #DestinoIncrível', drive_url = 'https://drive.google.com/file/d/10WpZTgI6o3Tunt9zZfOhl78qJwFHA_K6/view?usp=drive_link' WHERE title = 'Florianópolis';
UPDATE public.content_items SET description = 'Relembre momentos incríveis em Florianópolis - SC! 🏖️🌅 Conhecida como a "Ilha da Magia", Floripa tem praias para todos os gostos, de Jurerê a Campeche. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem, para você planejar sua próxima viagem dos sonhos.
✔️ Um destino com paisagens de tirar o fôlego e muita diversão.
Descubra mais pelo WhatsApp: (99) 9 9999-9999
#Florianópolis #TBTDeViagem #DestinoIncrível', drive_url = 'https://drive.google.com/file/d/10WpZTgI6o3Tunt9zZfOhl78qJwFHA_K6/view?usp=drive_link' WHERE title = 'Florianópolis - SC';
UPDATE public.content_items SET description = 'Levante cedo para viajar para Foz do Iguaçu e viva um dia incrível! 🌊✨ As Cataratas e o Parque das Aves são paradas obrigatórias nesse destino cheio de natureza. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem para você começar o dia com o pé direito.
✔️ Nada como um amanhecer rumo a um destino dos sonhos.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#AcordarCedo #ViagemDosSonhos #FériasIncríveis', drive_url = 'https://drive.google.com/file/d/10i5BGZUQ9BxjzOhbFCRQ-dJUhltV8nav/view?usp=drive_link' WHERE title = 'Foz do Iguaçu';
UPDATE public.content_items SET description = 'Fortaleza - CE te espera para uma viagem inesquecível! 🌊✨ Reúna a galera e curta o sol, as praias como Morro Branco e a cultura vibrante do Ceará. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar a cidade e arredores.
✔️ Uma experiência perfeita para grupos de amigos ou família.
Planeje agora pelo WhatsApp: (99) 9 9999-9999
#BoraPraFortaleza #ViagemComAmigos #FériasNaPraia', drive_url = 'https://drive.google.com/file/d/1EqYrTE5jDMNNBoSlL28CLuj3-1GuJGPb/view?usp=drive_link' WHERE title = 'Fortaleza - CE';
UPDATE public.content_items SET description = 'Viaje em família para Genipabu! 🐪🌴 Conhecido pelas dunas e passeios de buggy, esse destino é perfeito para crianças e adultos. Outras opções incríveis incluem Gramado, Florianópolis e Pantanal, com pacotes que incluem ✈️ passagens e 🏨 hospedagem.
✔️ Momentos inesquecíveis para todas as idades garantidos.
Planeje agora pelo WhatsApp: (99) 9 9999-9999
#ViagemComCrianças #FériasEmFamília #Genipabu 
Destinos Internacionais ✈️', drive_url = 'https://drive.google.com/file/d/164zk3RU3OkQ_lfEVE9u9hw4y2YdDILnX/view?usp=drive_link' WHERE title = 'Genipabu';
UPDATE public.content_items SET description = 'Evite surpresas no aeroporto ao viajar para Gramado! 🧳✈️ Confira dicas para não ter problemas com excesso de bagagem e curta o charme da Serra Gaúcha, com suas ruas floridas e o clima europeu. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem.
✔️ Viaje tranquilo e aproveite cada momento sem estresse.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#DicasDeViagem #ExcessoDeBagagem #ViagemSemEstresse', drive_url = 'https://drive.google.com/file/d/11L2RzID7XdutobpsEidXivyKsuumC2zs/view?usp=drive_link' WHERE title = 'Gramado';
UPDATE public.content_items SET description = 'Sonha com o Jalapão - TO? 🏜️🌄 Esse destino é famoso pelas dunas douradas, cachoeiras cristalinas e fervedouros únicos. Nosso pacote a partir de R$2.500 inclui ✈️ passagens, 🏨 hospedagem e passeios guiados para explorar o melhor da região.
✔️ Uma experiência de tranquilidade e conexão com a natureza.
Garanta sua viagem pelo WhatsApp: (99) 9 9999-9999
#Jalapão #DestinoDosSonhos #FériasNoParaíso', drive_url = 'https://drive.google.com/file/d/112UUcnFQlh6a6j4QtLXuyX83KO9w6MKZ/view?usp=drive_link' WHERE title = 'Jalapão - TO';
UPDATE public.content_items SET description = 'Relaxe em Jericoacoara - CE, um dos destinos mais charmosos do Brasil! 🌅✨ Conhecida pelo pôr do sol na Duna do Por do Sol e pela Lagoa do Paraíso, Jeri é perfeita para quem ama natureza e tranquilidade. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e traslados, com parcelamento no boleto para facilitar sua viagem.
✔️ Atendimento personalizado para você viajar sem preocupações.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#PlanejeSuasFérias #PacotesImperdíveis #FériasDosSonhos', drive_url = 'https://drive.google.com/file/d/11KjCpWManwQUucEcR5MNJWL-a5-U1jdr/view?usp=drive_link' WHERE title = 'Jericoacoara - CE';
UPDATE public.content_items SET description = 'Relaxe em Jericoacoara - CE, um dos destinos mais charmosos do Brasil! 🌅✨ Conhecida pelo pôr do sol na Duna do Por do Sol e pela Lagoa do Paraíso, Jeri é perfeita para quem ama natureza e tranquilidade. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e traslados, com parcelamento no boleto para facilitar sua viagem.
✔️ Atendimento personalizado para você viajar sem preocupações.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#PlanejeSuasFérias #PacotesImperdíveis #FériasDosSonhos', drive_url = 'https://drive.google.com/file/d/11KjCpWManwQUucEcR5MNJWL-a5-U1jdr/view?usp=drive_link' WHERE title = 'Jericoacoara - CE 2';
UPDATE public.content_items SET description = '✨ A aventura te espera com João Pessoa! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#JoãoPessoa #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'João Pessoa';
UPDATE public.content_items SET description = '✨ A aventura te espera com Lençóis Maranhenses! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#LençóisMaranhenses #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Lençóis Maranhenses';
UPDATE public.content_items SET description = 'Está na hora de planejar suas férias dos sonhos em Maceió - AL! 🌴✨ Curta 5 dias nesse paraíso nordestino com praias de águas cristalinas e coqueiros que parecem de cartão-postal. Nosso pacote inclui: ✈️ passagens aéreas de ida e volta, 🧳 bagagem despachada e 🏨 5 diárias em um hotel de luxo com vista para o mar. Tudo isso por apenas 10x de R$450,00!
✔️ Um destino perfeito para relaxar e tirar fotos incríveis 📸.
Garanta seu pacote agora no WhatsApp: (99) 9 9999-9999
#ViajarÉViver #MaceióDream #AgenciaDeViagens', drive_url = 'https://drive.google.com/file/d/11EaH5lDoZ-vz7qlySeti0YlYF71VXQb8/view?usp=drive_link' WHERE title = 'Maceió - AL';
UPDATE public.content_items SET description = 'Está na hora de planejar suas férias dos sonhos em Maceió - AL! 🌴✨ Curta 5 dias nesse paraíso nordestino com praias de águas cristalinas e coqueiros que parecem de cartão-postal. Nosso pacote inclui: ✈️ passagens aéreas de ida e volta, 🧳 bagagem despachada e 🏨 5 diárias em um hotel de luxo com vista para o mar. Tudo isso por apenas 10x de R$450,00!
✔️ Um destino perfeito para relaxar e tirar fotos incríveis 📸.
Garanta seu pacote agora no WhatsApp: (99) 9 9999-9999
#ViajarÉViver #MaceióDream #AgenciaDeViagens', drive_url = 'https://drive.google.com/file/d/11EaH5lDoZ-vz7qlySeti0YlYF71VXQb8/view?usp=drive_link' WHERE title = 'Maceió - AL 2';
UPDATE public.content_items SET description = 'Descubra as maravilhas de Maragogi! 🐠🌴 Suas águas cristalinas e corais são perfeitas para snorkeling e passeios de buggy. Nosso pacote a partir de 10x de R$450,00 inclui ✈️ passagens, 🏨 hospedagem e traslados para você aproveitar o melhor do destino.
✔️ Um pedacinho do paraíso brasileiro te espera.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#BelezasDoBrasil #ViajarPeloBrasil #FériasNoBrasil', drive_url = 'https://drive.google.com/file/d/10LeDT87lhcl9XFOck533SscCs5I2iqqZ/view?usp=drive_link' WHERE title = 'Maragogi';
UPDATE public.content_items SET description = 'Descubra as maravilhas de Maragogi! 🐠🌴 Suas águas cristalinas e corais são perfeitas para snorkeling e passeios de buggy. Nosso pacote a partir de 10x de R$450,00 inclui ✈️ passagens, 🏨 hospedagem e traslados para você aproveitar o melhor do destino.
✔️ Um pedacinho do paraíso brasileiro te espera.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#BelezasDoBrasil #ViajarPeloBrasil #FériasNoBrasil', drive_url = 'https://drive.google.com/file/d/10LeDT87lhcl9XFOck533SscCs5I2iqqZ/view?usp=drive_link' WHERE title = 'Maragogi - AL';
UPDATE public.content_items SET description = 'Curta o calor em 3 paraísos: Natal - RN, Porto de Galinhas e Angra dos Reis! 🏖️☀️ Natal tem dunas incríveis e passeios de buggy em Genipabu, perfeitos para o verão. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para você escolher seu destino favorito.
✔️ Três opções de praias paradisíacas para suas férias.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
 #DestinosDeVerão #ViajarÉViver', drive_url = 'https://drive.google.com/file/d/1vYhYavLpGaDnMdvti8tmHV_CAsv-MLNG/view?usp=drive_link' WHERE title = 'Natal - RN';
UPDATE public.content_items SET description = 'Planeje sua viagem para Ouro Preto com antecedência! 🏰✨ Para garantir as melhores ofertas em passagens e hospedagem, programe-se com 3 a 6 meses. Ouro Preto é famosa pela história, igrejas barrocas e o charme das ladeiras.
✔️ Economize e evite imprevistos para uma viagem perfeita.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#DicasDeViagem #PlanejamentoDeViagem #FériasPerfeitas' WHERE title = 'Ouro Preto';
UPDATE public.content_items SET description = 'Viva dias inesquecíveis no Pantanal! 🐾🌿 Conhecido pela biodiversidade, esse destino é ideal para safáris fotográficos e observação de animais como onças e jacarés. Nosso pacote para 2 adultos inclui ✈️ passagens e hospedagem, por apenas R$2.900.
✔️ Uma aventura na natureza que você nunca vai esquecer.
Garanta sua viagem pelo WhatsApp: (99) 9 9999-9999
#PantanalDosSonhos #PacoteDeViagem #FériasInesquecíveis', drive_url = 'https://drive.google.com/file/d/11-A9Nw4g9P0pY-FbtgeV2PNQBir1qi3E/view?usp=drive_link' WHERE title = 'Pantanal';
UPDATE public.content_items SET description = 'Planeje sua viagem para Porto de Galinhas pelo nosso site! 🏖️✈️ Rápido, seguro e com ofertas exclusivas, nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar as piscinas naturais e a vila charmosa de Porto.
✔️ Tudo pronto para sua próxima aventura em poucos cliques.
Acesse pelo WhatsApp: (99) 9 9999-9999
#CompreOnline #PacotesDeViagem #FériasDosSonhos', drive_url = 'https://drive.google.com/file/d/113qBaiObhwaIVivBhxIVej7gAss1Ekci/view?usp=drive_link' WHERE title = 'Porto de Galinhas';
UPDATE public.content_items SET description = 'Busca conforto em Recife? 🌴✨ Nosso pacote para a capital pernambucana inclui café da manhã delicioso, Wi-Fi, TV e estacionamento, a partir de 10x de R$450,00. Explore o Recife Antigo e as praias de Boa Viagem com total comodidade.
✔️ Tudo pensado para você relaxar e aproveitar ao máximo.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#PacotesCompletos #ViajarComConforto #BenefíciosExclusivos', drive_url = 'https://drive.google.com/file/d/10R4FB_cytxJtbLbyToePYOwBSuxpXE5A/view?usp=drive_link' WHERE title = 'Recife';
UPDATE public.content_items SET description = 'Descubra o Rio de Janeiro e viva experiências únicas! 🌄✨ Conhecida como a Cidade Maravilhosa, o Rio tem o Cristo Redentor, o Pão de Açúcar e praias famosas como Copacabana. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar os pontos turísticos mais icônicos.
✔️ Uma viagem para se encantar com cada cantinho da cidade.
Entre em contato pelo WhatsApp: (99) 9 9999-9999
#ViajarÉViver #MagiaDosDestinos #FériasInesquecíveis', drive_url = 'https://drive.google.com/file/d/10WyscibbG8F45bzSUJ0LWxhRYNBq9UiX/view?usp=drive_link' WHERE title = 'Rio de Janeiro';
UPDATE public.content_items SET description = 'Cada passo da sua viagem pela Rota das Emoções é memorável! 🏜️🚤 Esse roteiro inclui Lençóis Maranhenses, Delta do Parnaíba e Jericoacoara, com paisagens de tirar o fôlego. Nosso pacote oferece ✈️ passagens, 🏨 hospedagem e passeios guiados para curtir cada detalhe.
✔️ A aventura está em cada parada dessa jornada incrível.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#JornadaDeViagem #FériasIncríveis #ExperiênciasInesquecíveis' WHERE title = 'Rota das Emoções';
UPDATE public.content_items SET description = 'Viajar para Salvador - BA é colecionar momentos inesquecíveis! 🎭🌴 Explore o Pelourinho, prove o acarajé e sinta a energia única da Bahia. Nossos pacotes oferecem ✈️ passagens e 🏨 hospedagem, para você viver uma experiência cultural rica e vibrante.
✔️ Invista em memórias que valem mais que qualquer coisa.
Planeje pelo WhatsApp: (99) 9 9999-9999
#ViajarÉInvestir #FériasPerfeitas #MomentosInesquecíveis', drive_url = 'https://drive.google.com/file/d/11Ea8Vvrgff2o7h-FKfeHpvmAPG6mnd4M/view?usp=drive_link' WHERE title = 'Salvador - BA';
UPDATE public.content_items SET description = 'Planeje sua viagem dos sonhos para Trancoso - BA! 🏖️✨ Com praias paradisíacas e um centrinho charmoso, Trancoso é perfeito para relaxar e curtir a natureza. Nossos pacotes personalizados incluem ✈️ passagens, 🏨 hospedagem e passeios, com parcelamento em até 12x.
✔️ Um destino incrível para quem busca paz e beleza.
Fale com a gente pelo WhatsApp: (99) 9 9999-9999
#ExplorarOMundo #PacotesDeViagem #FériasPerfeitas', drive_url = 'https://drive.google.com/file/d/11E5sLSzQwF5DkCQG43uh5492tDNcmuRF/view?usp=drive_link' WHERE title = 'Trancoso - BA';
UPDATE public.content_items SET description = '✨ Descubra as maravilhas de Maragogi! ✈️🌍

Descubra as maravilhas de Maragogi! 🐠🌴 Suas águas cristalinas e corais são perfeitas para snorkeling e passeios de buggy. Nosso pacote a partir de 10x de R$450,00 inclui ✈️ passagens, 🏨 hospedagem e traslados para você aproveitar o melhor do destino. ✔️ Um pedacinho do paraíso brasileiro te espera. Fale com a gente pelo WhatsApp: (99) 9 9999-9999

🔥 Imagine você relaxando e aproveitando cada momento sem preocupações. Nosso pacote é pensado para você viver o melhor dessa viagem e colecionar momentos inesquecíveis!

👇 Clique no link da BIO ou nos chame no WhatsApp para garantir seu pacote exclusivo agora!
📲 (99) 9 9999-9999

#BelezasDoBrasil #ViajarPeloBrasil #FériasNoBrasil', drive_url = 'https://drive.google.com/file/d/10LeDT87lhcl9XFOck533SscCs5I2iqqZ/view?usp=drive_link' WHERE title = 'Pacote Maragogi (Grátis)';
UPDATE public.content_items SET description = '✨ Descubra as maravilhas de Rio de Janeiro! ✈️🌍

Descubra o Rio de Janeiro e viva experiências únicas! 🌄✨ Conhecida como a Cidade Maravilhosa, o Rio tem o Cristo Redentor, o Pão de Açúcar e praias famosas como Copacabana. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar os pontos turísticos mais icônicos. ✔️ Uma viagem para se encantar com cada cantinho da cidade. Entre em contato pelo WhatsApp: (99) 9 9999-9999

🔥 Imagine você relaxando e aproveitando cada momento sem preocupações. Nosso pacote é pensado para você viver o melhor dessa viagem e colecionar momentos inesquecíveis!

👇 Clique no link da BIO ou nos chame no WhatsApp para garantir seu pacote exclusivo agora!
📲 (99) 9 9999-9999

#ViajarÉViver #MagiaDosDestinos #FériasInesquecíveis', drive_url = 'https://drive.google.com/file/d/10WyscibbG8F45bzSUJ0LWxhRYNBq9UiX/view?usp=drive_link' WHERE title = 'Rio de Janeiro (Grátis)';
UPDATE public.content_items SET description = '✨ A aventura te espera com 3 Desejos para o Feriado! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#3DesejosparaoFeriado #ViagemPerfeita #AgenciaDeViagens' WHERE title = '3 Desejos para o Feriado';
UPDATE public.content_items SET description = '✨ A aventura te espera com Explorar o Mundo! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#ExploraroMundo #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Explorar o Mundo';
UPDATE public.content_items SET description = '✨ A aventura te espera com Feed Arte 1! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#FeedArte1 #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Feed Arte 1';
UPDATE public.content_items SET description = '✨ A aventura te espera com Feed Arte 2! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#FeedArte2 #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Feed Arte 2';
UPDATE public.content_items SET description = '✨ A aventura te espera com Feed Arte 3! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#FeedArte3 #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Feed Arte 3';
UPDATE public.content_items SET description = '✨ A aventura te espera com Feed Arte 5! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#FeedArte5 #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Feed Arte 5';
UPDATE public.content_items SET description = '✨ A aventura te espera com Story Arte 1! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#StoryArte1 #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Story Arte 1';
UPDATE public.content_items SET description = '✨ A aventura te espera com Story Arte 2! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#StoryArte2 #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Story Arte 2';
UPDATE public.content_items SET description = '✨ A aventura te espera com Semana 1! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#Semana1 #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Semana 1';
UPDATE public.content_items SET description = '✨ A aventura te espera com Semana 2! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#Semana2 #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Semana 2';
UPDATE public.content_items SET description = '✨ A aventura te espera com Semana 3! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#Semana3 #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Semana 3';
UPDATE public.content_items SET description = '✨ A aventura te espera com Semana 4! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#Semana4 #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'Semana 4';
UPDATE public.content_items SET description = 'Assistente IA para vender viagens' WHERE title = 'IA Vendedor de Viagens (novo)';
UPDATE public.content_items SET description = 'Crie títulos de alto impacto para seus conteúdos' WHERE title = 'Criador de Headlines (Mr. Beast)';
UPDATE public.content_items SET description = 'Gere promessas com mecanismo único' WHERE title = 'Criador de Promessas Únicas';
UPDATE public.content_items SET description = 'Crie funis de quiz interativos' WHERE title = 'Criador de Quizz 2.0';
UPDATE public.content_items SET description = 'Mapeie dores e desejos do seu público' WHERE title = 'Mapa de Dores e Desejos';
UPDATE public.content_items SET description = 'Desenvolva cursos em vídeo profissionais' WHERE title = 'Criador de Cursos em Vídeo';
UPDATE public.content_items SET description = 'Crie bônus e ofertas irresistíveis' WHERE title = 'Criador de Bônus e Order Bumps';
UPDATE public.content_items SET description = 'Desenvolva textos persuasivos para anúncios' WHERE title = 'Corpo de Anúncios';
UPDATE public.content_items SET description = 'Crie ganchos com 9 óticas diferentes' WHERE title = '9 Óticas de Hooks';
UPDATE public.content_items SET description = 'Narrar com sua voz - Crie narrações profissionais para vídeos' WHERE title = 'Narração de Ofertas de Viagens';
UPDATE public.content_items SET description = '✨ A aventura te espera com IA Vendedor de Viagens! ✈️🌍

🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.

👇 Clique no link da BIO para aproveitar as melhores condições!
📲 (99) 9 9999-9999

#IAVendedordeViagens #ViagemPerfeita #AgenciaDeViagens' WHERE title = 'IA Vendedor de Viagens';
