import { useState } from "react";
import { CaptionMatch, MatchedVideo, MatchStats } from "@/hooks/useImportCaptions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X, 
  MapPin, 
  Video, 
  Loader2,
  Edit2,
  Save
} from "lucide-react";

interface CaptionMatchTableProps {
  matches: CaptionMatch[];
  stats: MatchStats | null;
  isApplying: boolean;
  onToggleVideo: (destIdx: number, videoIdx: number) => void;
  onToggleDestination: (destIdx: number, selected: boolean) => void;
  onUpdateCaption: (destIdx: number, videoIdx: number, caption: string) => void;
  onUpdateDestinationCaption: (destIdx: number, caption: string) => void;
  onApply: () => void;
  onClear: () => void;
  getSelectionStats: () => { selectedCount: number; totalCount: number };
}

const getConfidenceBadge = (confidence: number) => {
  if (confidence >= 90) {
    return <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">Exato</Badge>;
  } else if (confidence >= 70) {
    return <Badge variant="secondary" className="bg-secondary text-secondary-foreground">Parcial</Badge>;
  } else {
    return <Badge variant="outline" className="border-muted-foreground/50 text-muted-foreground">Contexto</Badge>;
  }
};

interface DestinationCardProps {
  match: CaptionMatch;
  destIdx: number;
  onToggleVideo: (destIdx: number, videoIdx: number) => void;
  onToggleDestination: (destIdx: number, selected: boolean) => void;
  onUpdateCaption: (destIdx: number, videoIdx: number, caption: string) => void;
  onUpdateDestinationCaption: (destIdx: number, caption: string) => void;
}

const DestinationCard = ({
  match,
  destIdx,
  onToggleVideo,
  onToggleDestination,
  onUpdateCaption,
  onUpdateDestinationCaption,
}: DestinationCardProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState(match.caption);

  const selectedCount = match.matchedVideos.filter((v) => v.selected).length;
  const totalCount = match.matchedVideos.length;
  const allSelected = selectedCount === totalCount;
  const someSelected = selectedCount > 0 && selectedCount < totalCount;

  const handleSaveCaption = () => {
    onUpdateDestinationCaption(destIdx, editedCaption);
    setIsEditing(false);
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => {
                    onToggleDestination(destIdx, !!checked);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className={someSelected ? "data-[state=checked]:bg-primary/50" : ""}
                />
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    {match.destination}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedCount}/{totalCount} vídeo(s) selecionado(s)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Video className="h-3 w-3" />
                  {totalCount}
                </Badge>
                {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Caption Editor */}
            <div className="bg-muted/30 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Legenda do Destino</h4>
                {isEditing ? (
                  <Button size="sm" variant="ghost" onClick={handleSaveCaption}>
                    <Save className="h-4 w-4 mr-1" />
                    Salvar
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                )}
              </div>
              
              {isEditing ? (
                <Textarea
                  value={editedCaption}
                  onChange={(e) => setEditedCaption(e.target.value)}
                  rows={4}
                  className="text-sm"
                />
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                  {match.caption}
                </p>
              )}

              {match.hashtags && (
                <p className="text-xs text-primary font-mono break-all">
                  {match.hashtags}
                </p>
              )}
            </div>

            {/* Videos List */}
            <div className="space-y-2">
              {match.matchedVideos.map((video, videoIdx) => (
                <VideoMatchItem
                  key={video.videoId}
                  video={video}
                  destIdx={destIdx}
                  videoIdx={videoIdx}
                  onToggle={() => onToggleVideo(destIdx, videoIdx)}
                  onUpdateCaption={(caption) => onUpdateCaption(destIdx, videoIdx, caption)}
                />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

interface VideoMatchItemProps {
  video: MatchedVideo;
  destIdx: number;
  videoIdx: number;
  onToggle: () => void;
  onUpdateCaption: (caption: string) => void;
}

const VideoMatchItem = ({ video, destIdx, videoIdx, onToggle, onUpdateCaption }: VideoMatchItemProps) => {
  const [showEdit, setShowEdit] = useState(false);
  const [localCaption, setLocalCaption] = useState(video.adaptedCaption);

  return (
    <div
      className={`p-3 rounded-lg border transition-colors ${
        video.selected
          ? "bg-primary/5 border-primary/30"
          : "bg-muted/20 border-transparent"
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={video.selected}
          onCheckedChange={onToggle}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm truncate">{video.videoTitle}</span>
            {getConfidenceBadge(video.confidence)}
          </div>
          
          {showEdit ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={localCaption}
                onChange={(e) => setLocalCaption(e.target.value)}
                rows={3}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    onUpdateCaption(localCaption);
                    setShowEdit(false);
                  }}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Salvar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setLocalCaption(video.adaptedCaption);
                    setShowEdit(false);
                  }}
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowEdit(true)}
              className="mt-1 text-xs text-muted-foreground hover:text-foreground text-left"
            >
              <span className="underline">Editar legenda individual</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const CaptionMatchTable = ({
  matches,
  stats,
  isApplying,
  onToggleVideo,
  onToggleDestination,
  onUpdateCaption,
  onUpdateDestinationCaption,
  onApply,
  onClear,
  getSelectionStats,
}: CaptionMatchTableProps) => {
  const { selectedCount, totalCount } = getSelectionStats();

  if (matches.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
          <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              Matches Encontrados
            </CardTitle>
            {stats && (
              <p className="text-sm text-muted-foreground mt-1">
                {stats.totalDestinations} destino(s) • {stats.totalVideosMatched} de {stats.totalVideosAvailable} vídeo(s)
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClear} disabled={isApplying}>
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
            <Button onClick={onApply} disabled={isApplying || selectedCount === 0}>
              {isApplying ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-1" />
              )}
              {isApplying ? "Aplicando..." : `Aplicar ${selectedCount} Legenda(s)`}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selection Summary */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm">
            {selectedCount} de {totalCount} vídeo(s) selecionado(s)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => matches.forEach((_, idx) => onToggleDestination(idx, true))}
            >
              Selecionar Todos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => matches.forEach((_, idx) => onToggleDestination(idx, false))}
            >
              Desmarcar Todos
            </Button>
          </div>
        </div>

        {/* Destination Cards */}
        <div className="space-y-4">
          {matches.map((match, destIdx) => (
            <DestinationCard
              key={`${match.destination}-${destIdx}`}
              match={match}
              destIdx={destIdx}
              onToggleVideo={onToggleVideo}
              onToggleDestination={onToggleDestination}
              onUpdateCaption={onUpdateCaption}
              onUpdateDestinationCaption={onUpdateDestinationCaption}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
