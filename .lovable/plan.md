Plano: Corrigir Drag-and-Drop + Cache Invalidation + Featured Items
Diagnóstico
Analisando o código atual, identifiquei os seguintes problemas:

Problema	Causa	Impacto
Drag salva mas usuário não vê	
useUpdateDisplayOrder
 não invalida caches do frontend	Mudanças só aparecem após refresh
Cache admin vs frontend	handleDragEnd atualiza apenas all-content-items	Página do usuário usa content-items
Featured/Highlighted não atualizam	Falta invalidar featured-items, highlighted-items	Destaques não refletem mudanças
Destaques ES não aparecem	Query de featuredItems não filtra por idioma	Destaques em espanhol não exibem
Outras mutations não invalidam	Toggle featured, create, delete não invalidam cache	Mudanças não aparecem
O que já funciona:

sortByLanguagePriority já considera display_order (corrigido na última edição)
O drag-and-drop salva no banco corretamente
O que NÃO funciona:

useFeaturedItems
 NÃO filtra por idioma (precisa correção)
Mutations de toggle featured não invalidam cache
staleTime alto impede refetch automático
Solução em 4 Fases
Fase 1: Criar Hook de Invalidação Centralizado
Criar um novo hook que invalida todos os caches relevantes de uma vez.

Arquivo a criar: src/hooks/useInvalidateContent.ts

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
export const useInvalidateContent = () => {
  const queryClient = useQueryClient();
  const invalidateAll = useCallback(() => {
    // Admin caches
    queryClient.invalidateQueries({ queryKey: ['all-content-items'] });
    queryClient.invalidateQueries({ queryKey: ['all-captions'] });
    queryClient.invalidateQueries({ queryKey: ['all-marketing-tools'] });
    
    // User-facing caches
    queryClient.invalidateQueries({ queryKey: ['content-items'] });
    queryClient.invalidateQueries({ queryKey: ['featured-items'] });
    queryClient.invalidateQueries({ queryKey: ['highlighted-items'] });
    queryClient.invalidateQueries({ queryKey: ['video-templates'] });
    queryClient.invalidateQueries({ queryKey: ['captions'] });
    queryClient.invalidateQueries({ queryKey: ['marketing-tools'] });
    queryClient.invalidateQueries({ queryKey: ['newest-item-ids'] });
    
    console.log('🔄 All content caches invalidated');
  }, [queryClient]);
  return { invalidateAll };
};
Fase 2: Atualizar useUpdateDisplayOrder
Modificar para invalidar caches após salvar a ordem.

Arquivo: 
src/hooks/useContent.ts

LOCALIZAR 
useUpdateDisplayOrder
 e MODIFICAR:

export const useUpdateDisplayOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ table, items }: {
      table: 'content_items' | 'captions' | 'marketing_tools';
      items: { id: string; display_order: number }[];
    }) => {
      for (const item of items) {
        const { error } = await supabase
          .from(table)
          .update({ display_order: item.display_order })
          .eq('id', item.id);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      // ⭐ Invalidar TODOS os caches relevantes ⭐
      queryClient.invalidateQueries({ queryKey: ['all-content-items'] });
      queryClient.invalidateQueries({ queryKey: ['content-items'] });
      queryClient.invalidateQueries({ queryKey: ['featured-items'] });
      queryClient.invalidateQueries({ queryKey: ['highlighted-items'] });
      queryClient.invalidateQueries({ queryKey: ['video-templates'] });
      queryClient.invalidateQueries({ queryKey: ['all-captions'] });
      queryClient.invalidateQueries({ queryKey: ['captions'] });
      queryClient.invalidateQueries({ queryKey: ['all-marketing-tools'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-tools'] });
      
      console.log('✅ Display order updated and caches invalidated');
    },
  });
};
Fase 3: Corrigir Query de Featured Items (CRÍTICO)
PROBLEMA: 
useFeaturedItems
 NÃO está filtrando por idioma, por isso destaques ES não aparecem.

Arquivo: 
src/hooks/useContent.ts

LOCALIZAR 
useFeaturedItems
 e SUBSTITUIR COMPLETAMENTE:

export const useFeaturedItems = () => {
  const { language } = useLanguage();
  
  return useQuery({
    queryKey: ['featured-items', language],
    queryFn: async () => {
      let query = supabase
        .from('content_items')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true);
      // ⭐ FILTRAR POR IDIOMA ⭐
      if (language === 'pt') {
        // PT: mostrar itens PT ou sem idioma (NULL)
        query = query.or('language.eq.pt,language.is.null');
      } else {
        // ES: mostrar APENAS itens ES
        query = query.eq('language', language);
      }
      const { data, error } = await query
        .order('display_order', { ascending: true })
        .limit(10);
      if (error) throw error;
      // Aplicar ordenação client-side para garantir
      return sortByLanguagePriority(data || [], language);
    },
    staleTime: 0, // ⭐ IMPORTANTE: sempre refetch
  });
};
Fase 4: Adicionar Invalidação em TODAS as Mutations
PROBLEMA: Toggle featured, create, update, delete não invalidam cache.

Arquivo: 
src/components/gestao/ContentSection.tsx

ADICIONAR após imports:

import { useInvalidateContent } from '@/hooks/useInvalidateContent';
ADICIONAR no início do componente:

const { invalidateAll } = useInvalidateContent();
MODIFICAR todas as funções de mutation:

Toggle Featured:
const handleToggleFeatured = async (id: string, currentValue: boolean) => {
  const { error } = await supabase
    .from('content_items')
    .update({ is_featured: !currentValue })
    .eq('id', id);
  if (error) {
    toast({ title: "Erro", description: "Falha ao atualizar destaque" });
    return;
  }
  invalidateAll(); // ⭐ ADICIONAR
  toast({ title: "Sucesso", description: "Destaque atualizado" });
};
Create Item:
const handleCreate = async (newItem: any) => {
  const { error } = await supabase
    .from('content_items')
    .insert(newItem);
  if (error) {
    toast({ title: "Erro", description: "Falha ao criar item" });
    return;
  }
  invalidateAll(); // ⭐ ADICIONAR
  toast({ title: "Sucesso", description: "Item criado" });
};
Update Item:
const handleUpdate = async (id: string, updates: any) => {
  const { error } = await supabase
    .from('content_items')
    .update(updates)
    .eq('id', id);
  if (error) {
    toast({ title: "Erro", description: "Falha ao atualizar" });
    return;
  }
  invalidateAll(); // ⭐ ADICIONAR
  toast({ title: "Sucesso", description: "Item atualizado" });
};
Delete Item:
const handleDelete = async (id: string) => {
  const { error } = await supabase
    .from('content_items')
    .delete()
    .eq('id', id);
  if (error) {
    toast({ title: "Erro", description: "Falha ao deletar" });
    return;
  }
  invalidateAll(); // ⭐ ADICIONAR
  toast({ title: "Sucesso", description: "Item deletado" });
};
Fase 5: Garantir staleTime Correto
PROBLEMA: staleTime alto (5 minutos) impede refetch automático.

Arquivo: 
src/hooks/useContent.ts

MODIFICAR TODOS os hooks principais para:

// Em useContentItems, useVideoTemplates, useCaptions, useMarketingTools:
staleTime: 0, // ⭐ Mudar de 1000 * 60 * 5 para 0
Exemplo em 
useContentItems
:

export const useContentItems = (type?: string | string[], featuredOnly?: boolean) => {
  const { language } = useLanguage();
  
  return useQuery({
    queryKey: ['content-items', type, featuredOnly, language],
    queryFn: async () => {
      // ... código existente
      const ordered = sortByLanguagePriority(data || [], language);
      return ordered;
    },
    staleTime: 0, // ⭐ MUDAR AQUI
  });
};
Resumo das Mudanças
Arquivo	Ação	Mudança	Prioridade
src/hooks/useInvalidateContent.ts	CRIAR	Hook centralizado para invalidar caches	🔴 CRÍTICO
src/hooks/useContent.ts
MODIFICAR	Adicionar invalidação no 
useUpdateDisplayOrder
🔴 CRÍTICO
src/hooks/useContent.ts
MODIFICAR	Corrigir 
useFeaturedItems
 para filtrar por idioma	🔴 CRÍTICO
src/hooks/useContent.ts
MODIFICAR	Mudar staleTime de 300000 para 0 em todos hooks	🔴 CRÍTICO
src/components/gestao/ContentSection.tsx
MODIFICAR	Adicionar invalidateAll() em toggle/create/update/delete	🟡 IMPORTANTE
Fluxo Após Correção
Admin arrasta vídeo
    ↓
arrayMove() reordena localmente (UI atualiza instantâneo)
    ↓
updateDisplayOrder.mutate() salva no Supabase
    ↓
onSuccess: invalidateQueries() invalida TODOS os caches
    ↓
React Query refetch automático (staleTime: 0)
    ↓
Página do usuário exibe nova ordem ✅
Admin adiciona destaque ES
    ↓
handleToggleFeatured() atualiza no Supabase
    ↓
invalidateAll() invalida caches
    ↓
useFeaturedItems filtra por language === 'es'
    ↓
Usuário em ES vê destaque ✅
Verificação Final
Teste 1: Drag-and-Drop
Acesse /gestao → Vídeos
Selecione "Ordem manual (drag)"
Arraste vídeo para nova posição
Verifique toast "Ordem atualizada"
Abra DevTools → Console: deve mostrar "✅ Display order updated"
Abra nova aba anônima em /
VERIFICAR: Vídeo aparece na nova posição ✅
Teste 2: Destaques ES
Acesse /gestao → Destaques → Aba 🇪🇸 ES
Adicione 3 vídeos aos destaques ES
Abra nova aba em /
Mude idioma para ES (🇪🇸)
VERIFICAR: 3 destaques ES aparecem ✅
Mude para PT (🇧🇷)
VERIFICAR: Destaques mudam para PT ✅
Teste 3: Toggle Featured
Acesse /gestao → Vídeos
Clique na estrela de um vídeo (toggle featured)
Abra DevTools → Console: "🔄 All caches invalidated"
Abra página / em outra aba
VERIFICAR: Mudança aparece imediatamente ✅
Teste 4: Mudança de Idioma
Usuário em / (português)
Vídeos PT aparecem primeiro
Clica em 🇪🇸 ES
VERIFICAR: Vídeos ES aparecem PRIMEIRO ✅
Clica em 🇧🇷 PT
VERIFICAR: Vídeos PT voltam para PRIMEIRO ✅
Diferenças do Plano Original do Lovable
Item	Plano Lovable	Plano Corrigido
Hook invalidação	✅ Correto	✅ Mesmo
useUpdateDisplayOrder	✅ Correto	✅ Mesmo
useFeaturedItems	❌ Não menciona	✅ CORRIGIDO: filtro por idioma
staleTime	❌ Não menciona	✅ ADICIONADO: staleTime: 0
Outras mutations	❌ Não menciona	✅ ADICIONADO: invalidateAll()
Teste de destaques ES	❌ Não testa	✅ ADICIONADO
Por Que Essas Mudanças São Críticas
1. 
useFeaturedItems
 sem filtro por idioma
Problema: Mesmo adicionando destaques ES, eles não aparecem porque a query busca TODOS sem filtrar por language. Solução: Adicionar .or() para PT e .eq() para ES.

2. staleTime: 5 minutos
Problema: React Query não refaz query automaticamente por 5 minutos, então mudanças não aparecem. Solução: staleTime: 0 força refetch sempre que cache for invalidado.

3. Mutations sem invalidação
Problema: Toggle featured, create, delete não invalidam cache, então mudanças não aparecem. Solução: Adicionar invalidateAll() em TODAS as mutations.