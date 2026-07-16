# Canva Viagem — sites das agências

Esta pasta é a fonte canônica de contexto para qualquer agente ou pessoa que altere a geração, edição, publicação ou exibição dos sites das agências no Canva Viagem.

## Regra principal

O site publicado é uma projeção dos dados preenchidos pelo usuário na Fábrica. Logo, contatos, marca, cores, pacotes e demais conteúdos devem continuar sincronizados, automáticos e editáveis. Uma nova interface ou template não pode criar uma segunda fonte de verdade.

O formulário principal e sua integração com o CRM são contratos protegidos. A experiência de detalhes de pacote pode selecionar um pacote e encaminhar o visitante ao formulário existente, mas não deve duplicar nem substituir o fluxo de envio.

## Arquitetura resumida

```text
Fábrica/app → gera HTML → Supabase: estado, public_sites e Storage
                                      ↑
agencia.canvaviagem.com → Cloudflare wildcard Worker
                                      ↓
                             HTML público da agência
```

Pontos que devem ser entendidos sem ambiguidade:

- Cloudflare é a camada pública de DNS, proxy e roteamento dos subdomínios.
- O código atual salva o HTML publicado em `public_sites` no Supabase e o carrega pelo identificador da agência.
- O painel Cloudflare confirmou uma rota ativa `*.canvaviagem.com/*`. O Worker atual entrega os sites das agências diretamente de `public_sites`; ele não encaminha primeiro para a Lovable.
- A infraestrutura da Lovable foi identificada apenas como origem do app principal/Fábrica no apex. Não existe um “subdomínio Lovable por agência”.
- O `SiteViewer` é uma visualização/fallback interno da aplicação; não é a entrega normal dos subdomínios públicos.
- Vercel é infraestrutura histórica e está obsoleta para este fluxo. Arquivos residuais no repositório não autorizam um agente a publicar ou configurar o sistema nela.
- Um caminho como `/pacote/porto-de-galinhas` não cria outro domínio, registro DNS ou site independente. É apenas uma rota dentro do mesmo site da agência.
- Uma única rota wildcard de Cloudflare Worker já atende os subdomínios sem criar um domínio por cliente.

## Documentos

1. [Arquitetura Cloudflare e Supabase](./ARQUITETURA-CLOUDFLARE-SUPABASE.md)
2. [Regras de sites, formulário e CRM](./REGRAS-SITES-FORMULARIO-CRM.md)
3. [Plano de pacotes, pop-up e deep links](./PLANO-PACOTES-POPUP-E-DEEP-LINKS.md)
4. [Guia de campos por tipo de agência e pacote](./GUIA-CAMPOS-POR-TIPO-DE-AGENCIA-E-PACOTE.md)
5. [Estratégia de imagens e armazenamento](./ESTRATEGIA-IMAGENS-E-ARMAZENAMENTO.md)
6. [Checklist para agentes](./CHECKLIST-PARA-AGENTES.md)

## Prioridades combinadas

1. Preservar o que funciona, especialmente formulário, identificação da agência e CRM.
2. Manter todos os campos novos opcionais e compatíveis com registros antigos.
3. Fazer a experiência primeiro para celular e validar depois em desktop.
4. Exibir um resumo no card e carregar um único pop-up dinâmico com os dados do pacote clicado.
5. No CTA do pop-up, selecionar o pacote no formulário principal já existente.
6. Usar o mesmo cadastro estruturado no futuro para páginas, anúncios e carrosséis, sem redigitação.
7. Economizar armazenamento: reutilizar URLs do banco de imagens e processar apenas uploads locais.

## Segurança do contexto

Nunca grave nesta pasta ou no repositório:

- tokens de API;
- chaves privadas;
- credenciais do Supabase ou Cloudflare;
- identificadores acompanhados de segredos;
- valores copiados de conversas, prints ou terminais que permitam acesso a uma conta.

Credenciais devem existir apenas em gerenciadores de segredo ou variáveis de ambiente aprovadas. Se um segredo aparecer em chat ou log, ele deve ser rotacionado.

Última consolidação: 16 de julho de 2026.
