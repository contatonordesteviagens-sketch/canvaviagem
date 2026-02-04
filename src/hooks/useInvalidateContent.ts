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
