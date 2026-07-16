# Estratégia de imagens e armazenamento

## 1. Princípio

Uma imagem deve ser armazenada uma vez e reutilizada por URL em todos os lugares possíveis. O HTML publicado deve referenciar a imagem, não incorporar cópias em base64.

```text
arquivo único no armazenamento/CDN
        ├── card do site
        ├── pop-up do pacote
        ├── outro template
        └── carrossel futuro
```

## 2. Banco de imagens disponibilizado pela plataforma

Quando o usuário escolhe uma imagem já existente no banco da plataforma, salvar somente a URL/identificador canônico. Não baixar, converter e reenviar a mesma imagem em cada publicação.

Isso é correto se a URL:

- for estável;
- usar HTTPS;
- estiver em origem controlada ou licenciada;
- permitir exibição nos domínios do Canva Viagem;
- tiver cache e tamanho adequados;
- não expirar com assinatura temporária curta.

Se a “galeria” atual mistura links externos e arquivos internos, catalogar a origem de cada item. Não assumir que todo link de terceiro pode ser usado indefinidamente. Hotlink pode quebrar, mudar ou violar termos da fonte.

Direção recomendada: o banco oficial deve apontar para assets controlados pelo Canva Viagem em Storage/CDN. O estado do pacote guarda a referência, não uma cópia.

## 3. Imagem enviada pelo dispositivo

Somente uploads locais precisam do pipeline de processamento:

1. validar tipo e tamanho antes de decodificar;
2. corrigir orientação;
3. remover metadados desnecessários, inclusive EXIF;
4. redimensionar para a maior dimensão realmente usada;
5. converter preferencialmente para WebP;
6. manter fallback apenas onde necessário;
7. calcular hash do conteúdo processado;
8. reutilizar arquivo existente quando o hash já estiver armazenado;
9. enviar uma única vez;
10. gravar URL, dimensões, tamanho, hash e proprietário.

Parâmetros iniciais para validar visualmente:

- hero: até 1920 px de largura;
- cards/galeria: 1200 a 1600 px;
- miniaturas: 480 a 720 px;
- qualidade WebP fotográfica: aproximadamente 0,76 a 0,82;
- preservar transparência apenas quando necessária;
- impedir uploads excessivamente grandes antes do processamento.

Os números são pontos de partida, não uma regra cega. Logotipos, ilustrações e fotos têm necessidades diferentes.

## 4. Deduplicação

Nomes baseados apenas em timestamp criam uma nova cópia a cada republicação. Preferir uma chave estável:

```text
<usuario-ou-agencia>/<hash-do-conteudo>.<extensao>
```

Ao publicar:

- URL remota já aprovada: reutilizar;
- URL interna já persistida: reutilizar;
- base64/Blob local: processar, verificar hash e enviar se necessário;
- mesma imagem em dois pacotes: apontar ambos para o mesmo asset, respeitando propriedade e permissões.

Não remover imediatamente um asset quando um pacote deixa de usá-lo. Manter contagem de referências ou uma janela de retenção, depois executar limpeza de órfãos.

## 5. Supabase Storage e Cloudflare R2

### Estado atual

O projeto já utiliza Supabase Storage no fluxo de publicação. A mudança mais segura é otimizar esse fluxo primeiro: URL canônica, compressão, hash, deduplicação e limpeza de órfãos.

### Possível evolução para R2

R2 pode ser avaliado quando volume, egress, centralização no Cloudflare ou custo justificarem. A documentação pública oferece franquia gratuita mensal e egress sem cobrança, mas existem operações classificadas e limites que precisam ser medidos.

Migrar armazenamento não é requisito para implementar detalhes de pacote. Não manter duas bibliotecas paralelas sem um plano de migração e uma fonte canônica.

### Lovable Cloud

Não assumir que imagens estão armazenadas em uma “nuvem Lovable” apenas porque o projeto foi editado pela Lovable. Confirmar a URL e o bucket reais. No código atual analisado, Supabase é a camada de dados/arquivos identificada.

## 6. Entrega e cache

Para arquivos imutáveis com nome por hash:

```text
Cache-Control: public, max-age=31536000, immutable
```

Para referências mutáveis, usar cache menor ou versionar a URL. Incluir largura/altura no HTML para evitar mudança de layout. Aplicar `loading="lazy"` em imagens abaixo da dobra e prioridade somente à imagem principal visível.

Quando possível, gerar `srcset`/tamanhos responsivos. No celular, não baixar uma imagem de hero desktop de vários megabytes.

## 7. Formatos e qualidade

- WebP: padrão seguro para fotografias e boa economia.
- AVIF: pode economizar mais, mas custa mais CPU para gerar; avaliar como variante, não como dependência inicial.
- PNG: reservar para transparência/gráficos quando WebP não for apropriado.
- SVG: apenas para assets confiáveis e sanitizados; SVG arbitrário pode executar conteúdo ativo.
- GIF: evitar em banners; converter animações aprovadas para vídeo quando fizer sentido.

Sempre manter aparência aceitável depois da compressão. Testar rostos, texto dentro da imagem, gradientes e fotos noturnas.

## 8. Segurança

- validar MIME real, não apenas extensão;
- limitar bytes, pixels e quantidade por pacote;
- impedir SVG/HTML não sanitizado;
- associar cada upload ao usuário/agência;
- aplicar políticas de acesso no bucket;
- não aceitar URL `javascript:`, `data:text/html` ou protocolos inseguros;
- não gravar tokens em URL pública;
- não registrar arquivos ou links privados em logs públicos.

## 9. Limites de produto sugeridos

Para a primeira versão detalhada:

- 1 imagem principal;
- até 5 imagens adicionais por pacote;
- aviso e compressão automática para upload local;
- sem duplicar as imagens da galeria oficial;
- contador visível de imagens;
- estado vazio com instrução útil;
- remoção reversível antes de salvar.

Esses limites protegem o celular, a publicação e o armazenamento sem bloquear pacotes antigos.

## 10. Métricas a acompanhar

- bytes originais e bytes após processamento;
- taxa de compressão;
- quantidade de assets únicos;
- quantidade de referências reutilizadas;
- uploads por publicação;
- assets órfãos;
- tempo da maior imagem visível (LCP);
- erros por URL expirada ou origem bloqueada;
- custo mensal do Storage/operações.

## 11. Referência oficial

- [Cloudflare R2 — Pricing](https://developers.cloudflare.com/r2/pricing/)
