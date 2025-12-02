import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { templates } from "@/data/templates";
import { captions } from "@/data/captions";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

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
    
    const caption = captions.find(c => 
      template.title.toLowerCase().includes(c.destination.toLowerCase().split(' - ')[0])
    ) || captions[templateIndex % captions.length];

    return { template, caption };
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[120px]" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfYear = getDayOfYear(day, currentMonth, currentYear);
      const { template, caption } = getContentForDay(dayOfYear);

      days.push(
        <Card key={day} className="p-3 min-h-[120px] hover:shadow-lg transition-all duration-300 border-border/50">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary">{day}</span>
              <span className="text-xs text-muted-foreground">{template.type === "video" ? "🎬" : template.type === "feed" ? "🖼️" : "📱"}</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-foreground line-clamp-2">{template.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{caption.text.slice(0, 80)}...</p>
              <Button 
                size="sm" 
                variant="ghost" 
                className="w-full text-xs h-7 mt-1"
                onClick={() => window.open(template.url, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Editar
              </Button>
            </div>
          </div>
        </Card>
      );
    }

    return days;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Calendário de Postagens
          </h1>
          <p className="text-muted-foreground">
            Planeje seu conteúdo com 365 dias de templates e legendas prontas
          </p>
        </div>

        <Card className="p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={previousMonth} size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <Button variant="outline" onClick={nextMonth} size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
              <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {renderCalendar()}
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Calendar;
