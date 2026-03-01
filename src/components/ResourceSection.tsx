import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Lock } from "lucide-react";

interface Resource {
  name: string;
  url: string;
  icon: string;
  isNew?: boolean;
  onPremiumRequired?: () => void;
}

interface ResourceSectionProps {
  title: string;
  resources: Resource[];
  description?: string;
  locked?: boolean;
  onLockedClick?: () => void;
}

export const ResourceSection = ({ title, resources, description, locked = false, onLockedClick }: ResourceSectionProps) => {
  const handleResourceClick = (e: React.MouseEvent, resource: Resource) => {
    e.preventDefault();
    if (locked && onLockedClick) {
      onLockedClick();
      return;
    }
    if (resource.onPremiumRequired) {
      resource.onPremiumRequired();
      return;
    }
    window.open(resource.url, 'canva-resources');
  };

  return (
    <Card className="shadow-[var(--shadow-card)] border-border/50 relative">
      {locked && (
        <div className="absolute inset-0 z-20 bg-background/60 backdrop-blur-[2px] rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer" onClick={onLockedClick}>
          <div className="p-3 rounded-full bg-muted">
            <Lock className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">Exclusivo para assinantes</p>
        </div>
      )}
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardTitle className="text-2xl flex items-center gap-2">
          {title}
        </CardTitle>
        {description && <p className="text-muted-foreground text-sm mt-2">{description}</p>}
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-3">
          {resources.map((resource, index) => (
            <Button
              key={index}
              asChild
              variant="outline"
              className="w-full justify-start h-auto py-4 px-6 hover:bg-primary/5 hover:border-primary/30 transition-all group relative"
            >
              <a 
                href={resource.url} 
                rel="noopener noreferrer" 
                onClick={(e) => handleResourceClick(e, resource)}
                className="flex items-center gap-3"
              >
                <span className="text-2xl">{resource.icon}</span>
                <span className="flex-1 text-left font-medium">{resource.name}</span>
                {resource.isNew && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
                    Novo
                  </span>
                )}
                <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
