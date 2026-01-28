import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, ExternalLink, Copy } from "lucide-react";
import { templates } from "@/data/templates";
import { captions } from "@/data/captions";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PremiumGate } from "@/components/PremiumGate";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(0);
  const [currentYear, setCurrentYear] = useState(2024);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Inicializar com fuso horário de São Paulo
  useEffect(() => {
    const now = new Date();
    const saoPauloTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    setCurrentDate(saoPauloTime);
    setCurrentMonth(saoPauloTime.getMonth());
    setCurrentYear(saoPauloTime.getFullYear());
  }, []);

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
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

  const getDayOfYear = (day: number, month: number, year: number) => {
    const start = new Date(year, 0, 0);
    const diff = new Date(year, month, day).getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getContentForDay = (dayOfYear: number) => {
    const templateIndex = dayOfYear % templates.length;
    const template = templates[templateIndex];
    
    // Tentar encontrar uma legenda correspondente ao destino
    const caption = captions.find(c => 
      template.title.toLowerCase().includes(c.destination.toLowerCase().split(' - ')[0].toLowerCase()) ||
      c.destination.toLowerCase().includes(template.title.toLowerCase().split(' ')[0].toLowerCase())
    ) || captions[templateIndex % captions.length];

    return { template, caption };
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setIsDialogOpen(true);
  };

  const isToday = (day: number) => {
    const now = new Date();
    const saoPauloTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    return day === saoPauloTime.getDate() && 
           currentMonth === saoPauloTime.getMonth() && 
           currentYear === saoPauloTime.getFullYear();
  };

  const selectedDayContent = selectedDay ? getContentForDay(getDayOfYear(selectedDay, currentMonth, currentYear)) : null;

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[60px] md:min-h-[120px]" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfYear = getDayOfYear(day, currentMonth, currentYear);
      const { template } = getContentForDay(dayOfYear);
      const today = isToday(day);

      days.push(
        <Card 
          key={day} 
          className={`p-1.5 md:p-3 min-h-[60px] md:min-h-[120px] hover:shadow-lg transition-all duration-300 border-border/50 cursor-pointer ${
            today ? 'ring-2 ring-primary bg-primary/5' : ''
          }`}
          onClick={() => handleDayClick(day)}
        >
          <div className="space-y-0.5 md:space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-xs md:text-lg font-bold ${today ? 'text-primary' : ''}`}>
                {day}
              </span>
              <span className="text-[8px] md:text-xs">🎬</span>
            </div>
            {today && (
              <span className="text-[8px] md:text-xs bg-primary text-primary-foreground px-1 rounded block w-fit">
                Hoje
              </span>
            )}
            <div className="hidden md:block space-y-1">
              <p className="text-[10px] md:text-xs font-medium text-foreground line-clamp-2">{template.title}</p>
              <Button 
                size="sm" 
                variant="ghost" 
                className="w-full text-[10px] md:text-xs h-6 md:h-7 mt-1 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(template.url, '_blank');
                }}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                <span className="hidden md:inline">Editar</span>
              </Button>
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
          📅 Calendário de Postagens
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Planeje seu conteúdo com 365 dias de templates e legendas prontas
        </p>
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
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
            <div key={day} className="text-center font-semibold text-[10px] md:text-sm text-muted-foreground py-1 md:py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {renderCalendar()}
        </div>
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
              {/* Vídeo */}
              <div className="space-y-2 md:space-y-3">
                <h3 className="font-bold text-base md:text-lg flex items-center gap-2">
                  🎬 Vídeo do Dia
                </h3>
                <Card className="p-3 md:p-4 bg-muted/30">
                  <p className="font-medium mb-2 md:mb-3 text-sm md:text-base">{selectedDayContent.template.title}</p>
                  <Button 
                    className="w-full"
                    size="sm"
                    onClick={() => window.open(selectedDayContent.template.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Editar no Canva
                  </Button>
                </Card>
              </div>

              {/* Legenda */}
              <div className="space-y-2 md:space-y-3">
                <h3 className="font-bold text-base md:text-lg flex items-center gap-2">
                  📝 Legenda do Dia
                </h3>
                <Card className="p-3 md:p-4 bg-muted/30 space-y-2 md:space-y-3">
                  <p className="font-medium text-primary text-sm md:text-base">{selectedDayContent.caption.destination}</p>
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
                        `${selectedDayContent.caption.text}\n\n${selectedDayContent.caption.hashtags}`
                      );
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Legenda
                  </Button>
                </Card>
              </div>
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
