import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MatchedVideo {
  videoId: string;
  videoTitle: string;
  adaptedCaption: string;
  confidence: number;
  selected: boolean;
}

export interface CaptionMatch {
  destination: string;
  caption: string;
  hashtags: string;
  matchedVideos: MatchedVideo[];
}

export interface MatchStats {
  totalDestinations: number;
  totalVideosMatched: number;
  totalVideosAvailable: number;
}

export const useImportCaptions = () => {
  const queryClient = useQueryClient();
  const [matches, setMatches] = useState<CaptionMatch[]>([]);
  const [stats, setStats] = useState<MatchStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Process caption text with AI
  const processText = useCallback(async (captionsText: string, includeWithCaption: boolean = false) => {
    setIsProcessing(true);
    setMatches([]);
    setStats(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      if (!accessToken) {
        toast.error("Você precisa estar logado");
        return;
      }

      const response = await supabase.functions.invoke("match-captions-to-videos", {
        body: { captionsText, includeWithCaption },
      });

      if (response.error) {
        console.error("Edge function error:", response.error);
        toast.error(response.error.message || "Erro ao processar legendas");
        return;
      }

      const data = response.data;
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setMatches(data.matches || []);
      setStats(data.stats || null);

      if (data.matches?.length > 0) {
        const totalVideos = data.matches.reduce(
          (acc: number, m: CaptionMatch) => acc + (m.matchedVideos?.length || 0),
          0
        );
        toast.success(`${data.matches.length} destino(s) encontrado(s), ${totalVideos} vídeo(s) para atualizar`);
      } else {
        toast.info("Nenhum match encontrado. Verifique se os vídeos existem no banco.");
      }
    } catch (error) {
      console.error("Process error:", error);
      toast.error("Erro ao processar legendas");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Toggle video selection
  const toggleVideoSelection = useCallback((destinationIndex: number, videoIndex: number) => {
    setMatches((prev) =>
      prev.map((match, mIdx) => {
        if (mIdx !== destinationIndex) return match;
        return {
          ...match,
          matchedVideos: match.matchedVideos.map((video, vIdx) => {
            if (vIdx !== videoIndex) return video;
            return { ...video, selected: !video.selected };
          }),
        };
      })
    );
  }, []);

  // Toggle all videos in a destination
  const toggleDestinationVideos = useCallback((destinationIndex: number, selected: boolean) => {
    setMatches((prev) =>
      prev.map((match, mIdx) => {
        if (mIdx !== destinationIndex) return match;
        return {
          ...match,
          matchedVideos: match.matchedVideos.map((video) => ({ ...video, selected })),
        };
      })
    );
  }, []);

  // Update video caption
  const updateVideoCaption = useCallback((destinationIndex: number, videoIndex: number, newCaption: string) => {
    setMatches((prev) =>
      prev.map((match, mIdx) => {
        if (mIdx !== destinationIndex) return match;
        return {
          ...match,
          matchedVideos: match.matchedVideos.map((video, vIdx) => {
            if (vIdx !== videoIndex) return video;
            return { ...video, adaptedCaption: newCaption };
          }),
        };
      })
    );
  }, []);

  // Update destination caption (applies to all videos in that destination)
  const updateDestinationCaption = useCallback((destinationIndex: number, newCaption: string) => {
    setMatches((prev) =>
      prev.map((match, mIdx) => {
        if (mIdx !== destinationIndex) return match;
        return {
          ...match,
          caption: newCaption,
          matchedVideos: match.matchedVideos.map((video) => ({
            ...video,
            adaptedCaption: newCaption,
          })),
        };
      })
    );
  }, []);

  // Apply selected matches to database
  const applyMutation = useMutation({
    mutationFn: async () => {
      const selectedVideos: { id: string; caption: string }[] = [];

      for (const match of matches) {
        for (const video of match.matchedVideos) {
          if (video.selected) {
            // Combine caption with hashtags
            const fullCaption = video.adaptedCaption + (match.hashtags ? `\n\n${match.hashtags}` : "");
            selectedVideos.push({
              id: video.videoId,
              caption: fullCaption,
            });
          }
        }
      }

      if (selectedVideos.length === 0) {
        throw new Error("Nenhum vídeo selecionado");
      }

      // Update videos in batches
      const results = await Promise.all(
        selectedVideos.map((video) =>
          supabase
            .from("content_items")
            .update({ description: video.caption })
            .eq("id", video.id)
        )
      );

      // Check for errors
      const errors = results.filter((r) => r.error);
      if (errors.length > 0) {
        console.error("Update errors:", errors);
        throw new Error(`${errors.length} erro(s) ao atualizar`);
      }

      return selectedVideos.length;
    },
    onSuccess: (count) => {
      toast.success(`${count} vídeo(s) atualizado(s) com sucesso!`);
      setMatches([]);
      setStats(null);
      queryClient.invalidateQueries({ queryKey: ["content-items"] });
      queryClient.invalidateQueries({ queryKey: ["all-content-items"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erro ao aplicar legendas");
    },
  });

  // Get selection stats
  const getSelectionStats = useCallback(() => {
    let selectedCount = 0;
    let totalCount = 0;

    for (const match of matches) {
      for (const video of match.matchedVideos) {
        totalCount++;
        if (video.selected) {
          selectedCount++;
        }
      }
    }

    return { selectedCount, totalCount };
  }, [matches]);

  // Clear all matches
  const clearMatches = useCallback(() => {
    setMatches([]);
    setStats(null);
  }, []);

  return {
    matches,
    stats,
    isProcessing,
    isApplying: applyMutation.isPending,
    processText,
    toggleVideoSelection,
    toggleDestinationVideos,
    updateVideoCaption,
    updateDestinationCaption,
    applyMatches: applyMutation.mutate,
    getSelectionStats,
    clearMatches,
  };
};
