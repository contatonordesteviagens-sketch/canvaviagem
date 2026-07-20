# Horizonte Boutique — piloto isolado

Protótipo de um novo template one-page para o Canva Viagem. Ele ainda não altera o gerador atual e não envia leads para o CRM.

## Abrir a prévia

```powershell
node preview-server.mjs
```

Depois, abra `http://127.0.0.1:4177/`.

## O que provar nesta fase

- Um único objeto compatível com os dados da Fábrica alimenta identidade, contatos, cores, pacotes, conteúdo e formulário.
- **Simular outra agência** troca todos os dados, a identidade visual e a lista de pacotes sem trocar o template.
- **Editar esta prévia** habilita a edição inline de textos e a troca de todas as imagens comerciais.
- Os seletores de cor atualizam o site em tempo real.
- O formulário é criado a partir de `crmForm.fields` e monta um payload com `agency_id` e chaves `crmKey`.
- Nesta prévia, o envio é deliberadamente local: o payload aparece na tela e nenhuma chamada externa é feita.

## Validação reproduzível

```powershell
node validate-prototype.mjs
cmd /c npm exec -- vite build . --outDir C:/tmp/horizonte-build --emptyOutDir
```

Na integração definitiva, o submit local deve ser substituído pelo mesmo contrato de envio já usado pelo site atual, sem reescrever nem alterar o formulário/CRM aprovado.
