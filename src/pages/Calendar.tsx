import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, ExternalLink, Copy, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PremiumGate } from "@/components/PremiumGate";
import { useCalendarEntries, getDayOfYear, getDateFromDayOfYear, CalendarEntry } from "@/hooks/useCalendarEntries";
import { useContentItems, useCaptions } from "@/hooks/useContent";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { useGamification } from "@/hooks/useGamification";

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(0);
  const [currentYear, setCurrentYear] = useState(2024);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { setLanguage, t } = useLanguage();
  const { trackActivity } = useGamification();

  // Force PT language on this page
  const language = 'pt';
  useEffect(() => {
    document.documentElement.lang = 'pt';
    setLanguage('pt');
  }, [setLanguage]);

  // Initialize with São Paulo timezone
  useEffect(() => {
    const now = new Date();
    const saoPauloTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    setCurrentMonth(saoPauloTime.getMonth());
    setCurrentYear(saoPauloTime.getFullYear());
  }, []);

  // Fetch calendar entries from database
  const { data: calendarEntries, isLoading: entriesLoading } = useCalendarEntries(currentYear, currentMonth);

  // Fallback: fetch all videos and captions for days without entries
  const { data: allVideos } = useContentItems(['video', 'seasonal']);
  const { data: allCaptions } = useCaptions();

  // Month names by language
  const monthNames = [
    t('calendar.month.0'), t('calendar.month.1'), t('calendar.month.2'),
    t('calendar.month.3'), t('calendar.month.4'), t('calendar.month.5'),
    t('calendar.month.6'), t('calendar.month.7'), t('calendar.month.8'),
    t('calendar.month.9'), t('calendar.month.10'), t('calendar.month.11')
  ];

  // Day names by language
  const dayNames = [
    t('calendar.day.sun'), t('calendar.day.mon'), t('calendar.day.tue'),
    t('calendar.day.wed'), t('calendar.day.thu'), t('calendar.day.fri'),
    t('calendar.day.sat')
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDayOfYearForDate = (day: number, month: number, year: number) => {
    return getDayOfYear(new Date(year, month, day));
  };

  // Get content for a specific day - first check database, then fallback to rotation
  const getContentForDay = (day: number): {
    template: { title: string; url: string; icon?: string } | null;
    caption: { destination: string; text: string; hashtags: string } | null;
    notes: string | null;
    isFromDatabase: boolean;
  } => {
    const dayOfYear = getDayOfYearForDate(day, currentMonth, currentYear);

    // Check if there's a database entry for this day
    const dbEntry = calendarEntries?.find(
      entry => entry.day_of_year === dayOfYear && entry.year === currentYear
    );

    if (dbEntry) {
      return {
        template: dbEntry.content_item ? {
          title: dbEntry.content_item.title,
          url: dbEntry.content_item.url,
          icon: dbEntry.content_item.icon,
        } : null,
        caption: dbEntry.caption ? {
          destination: dbEntry.caption.destination,
          text: dbEntry.caption.text,
          hashtags: dbEntry.caption.hashtags,
        } : null,
        notes: dbEntry.notes,
        isFromDatabase: true,
      };
    }

    // Fallback: rotate through available content
    if (allVideos && allVideos.length > 0) {
      const templateIndex = dayOfYear % allVideos.length;
      const video = allVideos[templateIndex];

      // Try to find a matching caption
      let caption = null;
      if (allCaptions && allCaptions.length > 0) {
        caption = allCaptions.find(c =>
          video.title.toLowerCase().includes(c.destination.toLowerCase().split(' - ')[0].toLowerCase()) ||
          c.destination.toLowerCase().includes(video.title.toLowerCase().split(' ')[0].toLowerCase())
        ) || allCaptions[templateIndex % allCaptions.length];
      }

      return {
        template: {
          title: video.title,
          url: video.url,
          icon: video.icon,
        },
        caption: caption ? {
          destination: caption.destination,
          text: caption.text,
          hashtags: caption.hashtags,
        } : null,
        notes: null,
        isFromDatabase: false,
      };
    }

    return { template: null, caption: null, notes: null, isFromDatabase: false };
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setIsDialogOpen(true);

    // Gamification: user opened calendar content
    trackActivity('calendar'); // +15 pts
  };

  const isToday = (day: number) => {
    const now = new Date();
    const saoPauloTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    return day === saoPauloTime.getDate() &&
      currentMonth === saoPauloTime.getMonth() &&
      currentYear === saoPauloTime.getFullYear();
  };

  const selectedDayContent = selectedDay ? getContentForDay(selectedDay) : null;

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[60px] md:min-h-[120px]" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const content = getContentForDay(day);
      const today = isToday(day);
      const hasDbContent = content.isFromDatabase;

      days.push(
        <Card
          key={day}
          className={`p-1.5 md:p-3 min-h-[60px] md:min-h-[120px] hover:shadow-lg transition-all duration-300 border-border/50 cursor-pointer ${today ? 'ring-2 ring-primary bg-primary/5' : ''
            } ${hasDbContent ? 'border-l-2 border-l-green-500' : ''}`}
          onClick={() => handleDayClick(day)}
        >
          <div className="space-y-0.5 md:space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-xs md:text-lg font-bold ${today ? 'text-primary' : ''}`}>
                {day}
              </span>
              <span className="text-[8px] md:text-xs">
                {content.template?.icon || '🎬'}
              </span>
            </div>
            {today && (
              <span className="text-[8px] md:text-xs bg-primary text-primary-foreground px-1 rounded block w-fit">
                {t('calendar.today')}
              </span>
            )}
            {hasDbContent && (
              <span className="text-[6px] md:text-[10px] bg-green-500/20 text-green-700 px-1 rounded block w-fit">
                {t('calendar.scheduled')}
              </span>
            )}
            <div className="hidden md:block space-y-1">
              <p className="text-[10px] md:text-xs font-medium text-foreground line-clamp-2">
                {content.template?.title || t('calendar.noContentTitle')}
              </p>
              {content.template && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full text-[10px] md:text-xs h-6 md:h-7 mt-1 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(content.template!.url, '_blank');
                  }}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  <span className="hidden md:inline">Editar</span>
                </Button>
              )}
            </div>
          </div>
        </Card>
      );
    }

    return days;
  };

  const calendarContent = (
    <>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          📅 {t('calendar.title')}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {t('calendar.subtitle')}
        </p>
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            {t('calendar.scheduled')}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-muted rounded-full"></span>
            {t('calendar.autoSuggestion')}
          </span>
        </div>
      </div>

      <Card className="p-3 md:p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <Button variant="outline" onClick={previousMonth} size="icon" className="h-8 w-8 md:h-10 md:w-10">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg md:text-2xl font-bold">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <Button variant="outline" onClick={nextMonth} size="icon" className="h-8 w-8 md:h-10 md:w-10">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 md:mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center font-semibold text-[10px] md:text-sm text-muted-foreground py-1 md:py-2">
              {day}
            </div>
          ))}
        </div>

        {entriesLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {renderCalendar()}
          </div>
        )}
      </Card>

      {/* Dialog para mostrar conteúdo do dia */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">
              📅 {selectedDay} de {monthNames[currentMonth]} de {currentYear}
            </DialogTitle>
          </DialogHeader>

          {selectedDayContent && (
            <div className="space-y-4 md:space-y-6">
              {/* Status badge */}
              {selectedDayContent.isFromDatabase && (
                <div className="bg-green-500/10 text-green-700 text-sm p-2 rounded-lg flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {t('calendar.scheduledManually')}
                </div>
              )}

              {/* Notas do admin */}
              {selectedDayContent.notes && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <h4 className="font-medium text-sm mb-1">{t('calendar.notes')}</h4>
                  <p className="text-sm text-muted-foreground">{selectedDayContent.notes}</p>
                </div>
              )}

              {/* Vídeo */}
              {selectedDayContent.template && (
                <div className="space-y-2 md:space-y-3">
                  <h3 className="font-bold text-base md:text-lg flex items-center gap-2">
                    {t('calendar.videoOfDay')}
                  </h3>
                  <Card className="p-3 md:p-4 bg-muted/30">
                    <p className="font-medium mb-2 md:mb-3 text-sm md:text-base">
                      {selectedDayContent.template.title}
                    </p>
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={() => window.open(selectedDayContent.template!.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t('button.editCanva')}
                    </Button>
                  </Card>
                </div>
              )}

              {/* Legenda */}
              {selectedDayContent.caption && (
                <div className="space-y-2 md:space-y-3">
                  <h3 className="font-bold text-base md:text-lg flex items-center gap-2">
                    {t('calendar.captionOfDay')}
                  </h3>
                  <Card className="p-3 md:p-4 bg-muted/30 space-y-2 md:space-y-3">
                    <p className="font-medium text-primary text-sm md:text-base">
                      {selectedDayContent.caption.destination}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground whitespace-pre-line">
                      {selectedDayContent.caption.text}
                    </p>
                    <p className="text-[10px] md:text-xs text-accent font-medium">
                      {selectedDayContent.caption.hashtags}
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${selectedDayContent.caption!.text}\n\n${selectedDayContent.caption!.hashtags}`
                        );
                        toast.success(t('button.copied'));
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {t('calendar.copyCaption')}
                    </Button>
                  </Card>
                </div>
              )}

              {!selectedDayContent.template && !selectedDayContent.caption && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t('calendar.noContent')}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-7xl">
        <PremiumGate>
          {calendarContent}
        </PremiumGate>
      </div>

      <Footer />
    </div>
  );
};

export default Calendar;