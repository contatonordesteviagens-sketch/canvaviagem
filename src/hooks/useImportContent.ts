import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ContentType = 'video' | 'feed' | 'story' | 'caption' | 'tool' | 'resource';

export interface ParsedItem {
  title: string;
  url: string;
  destination?: string;
  text?: string;
  hashtags?: string;
}

export const useImportContent = () => {
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const queryClient = useQueryClient();

  // Parse local file (TXT, CSV)
  const parseLocalFile = async (file: File): Promise<ParsedItem[]> => {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    const items: ParsedItem[] = [];
    
    for (const line of lines) {
      // Try different delimiters
      let parts = line.includes('|') ? line.split('|') : 
                  line.includes(';') ? line.split(';') : 
                  line.includes('\t') ? line.split('\t') : 
                  [line];
      
      parts = parts.map(p => p.trim());
      
      if (parts.length >= 2) {
        items.push({
          title: parts[0],
          url: parts[1],
        });
      } else if (parts[0].startsWith('http')) {
        // URL only - extract title from URL
        const url = parts[0];
        const title = url.split('/').pop()?.replace(/-/g, ' ').replace(/\.\w+$/, '') || 'Sem título';
        items.push({ title, url });
      }
    }
    
    return items;
  };

  // Parse file with AI (for complex formats like PDF)
  const parseWithAI = async (file: File): Promise<ParsedItem[]> => {
    setIsParsingFile(true);
    
    try {
      // Convert file to base64
      const buffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const response = await supabase.functions.invoke('parse-content-file', {
        body: { 
          fileContent: base64,
          fileName: file.name,
          mimeType: file.type,
        },
      });

      if (response.error) throw response.error;
      return response.data.items || [];
    } finally {
      setIsParsingFile(false);
    }
  };

  // Main parse function
  const parseFile = async (file: File): Promise<ParsedItem[]> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'txt' || extension === 'csv') {
      const items = await parseLocalFile(file);
      setParsedItems(items);
      return items;
    } else if (extension === 'pdf' || extension === 'xlsx' || extension === 'xls') {
      const items = await parseWithAI(file);
      setParsedItems(items);
      return items;
    }
    
    throw new Error('Formato de arquivo não suportado');
  };

  // Import content items
  const importContentMutation = useMutation({
    mutationFn: async ({ items, type }: { items: ParsedItem[]; type: ContentType }) => {
      if (type === 'caption') {
        // Insert captions
        const { error } = await supabase.from("captions").insert(
          items.map((item, index) => ({
            destination: item.destination || item.title,
            text: item.text || '',
            hashtags: item.hashtags || '',
            display_order: index,
            is_active: true,
          }))
        );
        if (error) throw error;
      } else if (type === 'tool') {
        // Insert marketing tools
        const { error } = await supabase.from("marketing_tools").insert(
          items.map((item, index) => ({
            title: item.title,
            url: item.url,
            display_order: index,
            is_active: true,
          }))
        );
        if (error) throw error;
      } else {
        // Insert content items
        const { error } = await supabase.from("content_items").insert(
          items.map((item, index) => ({
            title: item.title,
            url: item.url,
            type: type,
            display_order: index,
            is_active: true,
          }))
        );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-content-items"] });
      queryClient.invalidateQueries({ queryKey: ["all-captions"] });
      queryClient.invalidateQueries({ queryKey: ["all-marketing-tools"] });
      queryClient.invalidateQueries({ queryKey: ["content-items"] });
      queryClient.invalidateQueries({ queryKey: ["captions"] });
      queryClient.invalidateQueries({ queryKey: ["marketing-tools"] });
      setParsedItems([]);
    },
  });

  const clearParsedItems = () => setParsedItems([]);

  return {
    parseFile,
    parsedItems,
    setParsedItems,
    clearParsedItems,
    isParsingFile,
    importContent: importContentMutation.mutate,
    isImporting: importContentMutation.isPending,
  };
};
