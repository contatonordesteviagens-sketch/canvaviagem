import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink, Copy } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PremiumGate } from "@/components/PremiumGate";
import { useCalendarEntries, getDayOfYear } from "@/hooks/useCalendarEntries";
import { useContentItems, useCaptions } from "@/hooks/useContent";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { useGamification } from "@/hooks/useGamification";
import { CalendarBase } from "@/components/ui/CalendarBase";

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { setLanguage, t } = useLanguage();
  const { trackActivity } = useGamification();

  useEffect(() => {
    document.documentElement.lang = 'pt';
    setLanguage('pt');
  }, [setLanguage]);

  const { data: calendarEntries } = useCalendarEntries(currentYear, currentMonth);
  const { data: allVideos } = useContentItems(['video', 'seasonal']);
  const { data: allCaptions } = useCaptions();

  const monthNames = [
    t('calendar.month.0'), t('calendar.month.1'), t('calendar.month.2'),
    t('calendar.month.3'), t('calendar.month.4'), t('calendar.month.5'),
    t('calendar.month.6'), t('calendar.month.7'), t('calendar.month.8'),
    t('calendar.month.9'), t('calendar.month.10'), t('calendar.month.11')
  ];

  const getContentForDay = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const dayOfYear = getDayOfYear(date);
    const dbEntry = calendarEntries?.find(
      entry => entry.day_of_year === dayOfYear && entry.year === currentYear
    );

    if (dbEntry) {
      return {
        template: dbEntry.content_item ? { title: dbEntry.content_item.title, url: dbEntry.content_item.url, icon: dbEntry.content_item.icon } : null,
        caption: dbEntry.caption ? { destination: dbEntry.caption.destination, text: dbEntry.caption.text, hashtags: dbEntry.caption.hashtags } : null,
        notes: dbEntry.notes,
        isFromDatabase: true,
      };
    }

    if (allVideos && allVideos.length > 0) {
      const templateIndex = dayOfYear % allVideos.length;
      const video = allVideos[templateIndex];
      let caption = null;
      if (allCaptions && allCaptions.length > 0) {
        caption = allCaptions.find(c =>
          video.title.toLowerCase().includes(c.destination.toLowerCase().split(' - ')[0].toLowerCase())
        ) || allCaptions[templateIndex % allCaptions.length];
      }
      return {
        template: { title: video.title, url: video.url, icon: video.icon },
        caption: caption ? { destination: caption.destination, text: caption.text, hashtags: caption.hashtags } : null,
        notes: null,
        isFromDatabase: false,
      };
    }
    return { template: null, caption: null, notes: null, isFromDatabase: false };
  };

  const handleDateSelect = (date: any) => {
    setSelectedDay(date.day);
    setCurrentMonth(date.month - 1);
    setCurrentYear(date.year);
    setIsDialogOpen(true);
    trackActivity('calendar');
  };

  const selectedDayContent = selectedDay ? getContentForDay(selectedDay) : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl pb-32">
        <PremiumGate>
          <div className="mb-12 text-center">
            <h1 className="text-3xl md:text-5xl font-black mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent italic uppercase tracking-tighter">
              📅 {t('calendar.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto italic">
              Seu guia diário para vender mais hoje.
            </p>
          </div>
          <div className="flex justify-center mb-20">
            <CalendarBase aria-label="Calendário" onChange={handleDateSelect} className="w-full max-w-2xl shadow-2xl border-primary/20" />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-lg shadow-2xl border-primary/30">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight italic">
                  {selectedDay} de {monthNames[currentMonth]}
                </DialogTitle>
              </DialogHeader>
              {selectedDayContent && (
                <div className="space-y-6 pt-4">
                  {selectedDayContent.template && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold flex items-center gap-2">🎬 Vídeo do Dia</h3>
                      <Card className="p-4 bg-muted/40 border-primary/20">
                        <p className="font-bold mb-4 text-lg">{selectedDayContent.template.title}</p>
                        <Button className="w-full h-12 text-lg font-bold shadow-lg" onClick={() => window.open(selectedDayContent.template!.url, '_blank')}>
                          <ExternalLink className="mr-2 h-5 w-5" /> Abrir no Canva
                        </Button>
                      </Card>
                    </div>
                  )}
                  {selectedDayContent.caption && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold flex items-center gap-2">✍️ Legenda Sugerida</h3>
                      <Card className="p-4 bg-muted/40 border-accent/20 space-y-4">
                        <p className="font-black text-primary uppercase text-sm tracking-widest">{selectedDayContent.caption.destination}</p>
                        <p className="text-sm italic leading-relaxed whitespace-pre-line bg-background/50 p-4 rounded-xl border">
                          "{selectedDayContent.caption.text}"
                        </p>
                        <p className="text-xs font-mono text-accent">{selectedDayContent.caption.hashtags}</p>
                        <Button variant="outline" className="w-full h-11 font-bold border-accent/30 text-accent hover:bg-accent/10" onClick={() => {
                          navigator.clipboard.writeText(`${selectedDayContent.caption!.text}\n\n${selectedDayContent.caption!.hashtags}`);
                          toast.success("Legenda Copiada!");
                        }}>
                          <Copy className="mr-2 h-4 w-4" /> COPIAR TUDO
                        </Button>
                      </Card>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </PremiumGate>
      </main>
      <Footer />
    </div>
  );
};

export default Calendar;