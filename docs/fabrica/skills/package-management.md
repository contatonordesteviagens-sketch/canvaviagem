# 📦 Gestão de Pacotes e Ativos (Fase 2)

A Fase 2 foi modernizada para permitir total flexibilidade na gestão das ofertas que alimentam o funil de vendas.

## 1. Gerenciador de Pacotes (CRUD)

O componente `Phase2Ativos.tsx` agora possui um estado local robusto que permite:
- **Adicionar**: Criar novos pacotes do zero.
- **Editar**: Modificar títulos, preços, parcelas e benefícios de pacotes existentes.
- **Duplicar**: Clonar um pacote para criar variações rápidas.
- **Remover**: Excluir ofertas que não fazem mais sentido para o período.

## 2. Base de Dados Expandida

O arquivo `src/data/fabrica-ofertas.ts` foi expandido para incluir 8 a 10 pacotes por nicho (Nordeste, Sul, Internacional, etc.). 
- Ao trocar o nicho na Fase 1, a Fase 2 recarrega automaticamente as sugestões desse nicho.
- Se o usuário editar um pacote, essa edição é mantida enquanto ele permanecer na sessão.

## 3. Sincronização com o Motor

Todos os dados editados na Fase 2 são passados para o `useFabricaContext`. Quando o usuário chega na Fase 3 (Arte), o motor de renderização consome esses dados atualizados para gerar as artes finais.
