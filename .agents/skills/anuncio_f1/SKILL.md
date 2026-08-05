---
name: anuncio-f1
description: Regras e diretrizes para a criação de Anúncios F1 (Carrosséis) no projeto Canva Viagem.
---

# Anúncio F1 (Carrossel)

Esta skill documenta o comportamento, regras e o contexto arquitetural do "Anúncio F1" (Carrossel F1).

## O que é o Anúncio F1?

O Anúncio F1 é um formato de Carrossel gerado através do componente `F1CarouselBuilder.tsx`. Ele tem o objetivo de criar uma sequência de slides para anúncios de pacotes de viagens.

## Regras Principais

1. **Formatos Suportados:** Feed (4:5) ou Story (9:16).
2. **Quantidade de Slides:** Criação sequencial de 3 a 7 slides.
3. **Modelos:**
   - *Impacto*
   - *Roteiro*
   - *Editorial*
4. **Fonte de Dados:** Consome exclusivamente os dados ("fatos") do `Pacote`.

## Instruções para Agentes

- Sempre que for necessário realizar manutenção ou criação envolvendo anúncios no formato Carrossel, lembre-se de respeitar o modelo escolhido.
- A implementação visual e os estilos devem manter coerência com o motor de renderização da Fábrica (`fabrica-compose-art.ts`).
- Não crie novos formatos sem antes verificar as regras estabelecidas para os modelos Impacto, Roteiro e Editorial.

*Observação: Edite este arquivo adicionando regras mais específicas de design (ex: tokens de px, quebras de linha) conforme for necessário para o treinamento do agente.*
