import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

interface DateRangeFilterProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}

const presets = [
  { 
    label: "Ontem", 
    getValue: () => ({ 
      from: startOfDay(subDays(new Date(), 1)), 
      to: endOfDay(subDays(new Date(), 1)) 
    }) 
  },
  { 
    label: "3D", 
    getValue: () => ({ 
      from: startOfDay(subDays(new Date(), 2)), 
      to: endOfDay(new Date()) 
    }) 
  },
  { 
    label: "7D", 
    getValue: () => ({ 
      from: startOfDay(subDays(new Date(), 6)), 
      to: endOfDay(new Date()) 
    }) 
  },
  { 
    label: "1 Mês", 
    getValue: () => ({ 
      from: startOfDay(subDays(new Date(), 29)), 
      to: endOfDay(new Date()) 
    }) 
  },
  { 
    label: "Mês Passado", 
    getValue: () => ({ 
      from: startOfMonth(subMonths(new Date(), 1)), 
      to: endOfMonth(subMonths(new Date(), 1)) 
    }) 
  },
  { 
    label: "Máximo", 
    getValue: () => ({ 
      from: new Date(2020, 0, 1), 
      to: endOfDay(new Date()) 
    }) 
  },
];

export const DateRangeFilter = ({ value, onChange }: DateRangeFilterProps) => {
  const [activePreset, setActivePreset] = useState<string>("7D");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handlePresetClick = (preset: typeof presets[0]) => {
    setActivePreset(preset.label);
    onChange(preset.getValue());
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setActivePreset("");
      onChange({
        from: startOfDay(range.from),
        to: endOfDay(range.to),
      });
    } else if (range?.from) {
      onChange({
        from: startOfDay(range.from),
        to: undefined,
      });
    }
  };

  const formatDateRange = () => {
    if (!value?.from) return "Selecione um período";
    if (!value.to) return format(value.from, "dd/MM/yyyy", { locale: ptBR });
    return `${format(value.from, "dd/MM", { locale: ptBR })} - ${format(value.to, "dd/MM/yyyy", { locale: ptBR })}`;
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((preset) => (
        <Button
          key={preset.label}
          variant={activePreset === preset.label ? "default" : "outline"}
          size="sm"
          onClick={() => handlePresetClick(preset)}
          className="h-8"
        >
          {preset.label}
        </Button>
      ))}
      
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant={activePreset === "" ? "default" : "outline"} 
            size="sm" 
            className={cn("h-8 gap-2", !activePreset && "min-w-[180px]")}
          >
            <CalendarIcon className="h-4 w-4" />
            {activePreset === "" ? formatDateRange() : <span className="sr-only">Calendário</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50 bg-popover" align="end">
          <Calendar
            mode="range"
            selected={value}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
            locale={ptBR}
            className="pointer-events-auto"
            disabled={(date) => date > new Date()}
          />
          <div className="p-3 border-t flex justify-end">
            <Button 
              size="sm" 
              onClick={() => setIsCalendarOpen(false)}
              disabled={!value?.from || !value?.to}
            >
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
