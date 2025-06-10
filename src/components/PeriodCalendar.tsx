
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  isDateInPredictedPeriod,
  isDateInOvulationPeriod,
  isDateInFertileWindow,
  getAdvancedPrediction,
  getPeriodLength,
  getLastPeriodStartDate,
  getDataForDate
} from "@/utils/periodUtils";
import { addDays, startOfDay, format } from "date-fns";

interface PeriodCalendarProps {
  selectedDate: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  className?: string;
  month?: Date;
  onMonthChange?: (date: Date) => void;
}

export function PeriodCalendar({ 
  selectedDate, 
  onSelect,
  className,
  month,
  onMonthChange
}: PeriodCalendarProps) {
  const [calendarMonth, setCalendarMonth] = useState<Date>(month || new Date());
  const [key, setKey] = useState(0);
  
  // Handle month change and pass to parent if needed
  const handleMonthChange = (date: Date) => {
    setCalendarMonth(date);
    if (onMonthChange) {
      onMonthChange(date);
    }
  };
  
  // Listen for cycle settings updates
  useEffect(() => {
    const handleCycleUpdate = () => {
      console.log("PeriodCalendar: Cycle settings updated, refreshing...");
      setKey(prev => prev + 1);
    };

    window.addEventListener('cycleSettingsUpdated', handleCycleUpdate);
    
    return () => {
      window.removeEventListener('cycleSettingsUpdated', handleCycleUpdate);
    };
  }, []);
  
  useEffect(() => {
    if (month) {
      setCalendarMonth(month);
    }
  }, [month]);
  
  // Get prediction information (will recalculate when key changes)
  const prediction = getAdvancedPrediction();

  console.log("PeriodCalendar Debug:", {
    prediction,
    lastPeriodStart: getLastPeriodStartDate(),
    periodLength: getPeriodLength()
  });

  // Helper function to check if a date is within the current period based on last period start and period length
  const isDateInCurrentPeriod = (date: Date): boolean => {
    const lastStart = getLastPeriodStartDate();
    if (!lastStart) return false;
    
    const periodLength = getPeriodLength();
    const checkDate = startOfDay(date);
    const periodStart = startOfDay(lastStart);
    const periodEnd = startOfDay(addDays(lastStart, periodLength - 1));
    
    const isInPeriod = checkDate >= periodStart && checkDate <= periodEnd;
    console.log("Current period check:", {
      date: format(date, 'yyyy-MM-dd'),
      lastStart: format(lastStart, 'yyyy-MM-dd'),
      periodEnd: format(periodEnd, 'yyyy-MM-dd'),
      periodLength,
      isInPeriod
    });
    
    return isInPeriod;
  };

  // Helper to get additional day information for the calendar tooltip
  const getDayDescription = (date: Date): string => {
    // Check if there's logged data
    const dayData = getDataForDate(date);
    if (dayData && dayData.flow !== "none") {
      return `Period day (${dayData.flow})`;
    }
    
    if (isDateInCurrentPeriod(date)) {
      return "Period day";
    }
    
    if (isDateInPredictedPeriod(date)) {
      return "Predicted period";
    }
    
    if (isDateInOvulationPeriod(date)) {
      return "Ovulation";
    }
    
    if (isDateInFertileWindow(date)) {
      return "Fertile window";
    }
    
    return format(date, "MMMM d, yyyy");
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <style>
        {`
          .rdp-day {
            position: relative;
          }
          
          .current-period-day {
            background-color: rgb(239 68 68) !important;
            color: white !important;
            border-radius: 6px;
          }
          
          .current-period-day:hover {
            background-color: rgb(220 38 38) !important;
            color: white !important;
          }
          
          .dark .current-period-day {
            background-color: rgb(127 29 29) !important;
            color: white !important;
          }
          
          .dark .current-period-day:hover {
            background-color: rgb(153 27 27) !important;
            color: white !important;
          }
          
          .fertile-window-day {
            background-color: rgb(220 252 231) !important;
            color: rgb(22 101 52) !important;
            border-radius: 6px;
          }
          
          .dark .fertile-window-day {
            background-color: rgb(20 83 45) !important;
            color: rgb(220 252 231) !important;
          }
          
          .fertile-window-day:hover {
            background-color: rgb(187 247 208) !important;
          }
          
          .dark .fertile-window-day:hover {
            background-color: rgb(22 101 52) !important;
          }
          
          .ovulation-day {
            background-color: rgb(254 215 170) !important;
            color: rgb(194 65 12) !important;
            border-radius: 6px;
          }
          
          .dark .ovulation-day {
            background-color: rgb(154 52 18) !important;
            color: rgb(255 247 237) !important;
          }
          
          .ovulation-day:hover {
            background-color: rgb(254 215 170) !important;
            color: rgb(154 52 18) !important;
          }
          
          .dark .ovulation-day:hover {
            background-color: rgb(194 65 12) !important;
          }
          
          .prediction-day {
            background-color: rgb(253 242 248) !important;
            color: rgb(190 24 93) !important;
            border-radius: 6px;
          }
          
          .dark .prediction-day {
            background-color: rgb(131 24 67) !important;
            color: rgb(253 242 248) !important;
          }
          
          .prediction-day:hover {
            background-color: rgb(252 231 243) !important;
          }
          
          .dark .prediction-day:hover {
            background-color: rgb(190 24 93) !important;
          }
          
          .rdp-day_selected {
            border: 2px solid var(--ring) !important;
          }

          .rdp-day_today {
            border: 1px dashed var(--muted-foreground) !important;
          }
          
          .current-period-day::after,
          .fertile-window-day::after,
          .ovulation-day::after,
          .prediction-day::after {
            content: '';
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%);
            width: 6px;
            height: 6px;
            border-radius: 50%;
          }
          
          .current-period-day::after {
            background-color: white;
          }
          
          .fertile-window-day::after {
            background-color: rgb(22 163 74);
          }
          
          .dark .fertile-window-day::after {
            background-color: rgb(220 252 231);
          }
          
          .ovulation-day::after {
            background-color: rgb(234 88 12);
          }
          
          .dark .ovulation-day::after {
            background-color: rgb(255 247 237);
          }
          
          .prediction-day::after {
            background-color: rgb(219 39 119);
          }
          
          .dark .prediction-day::after {
            background-color: rgb(253 242 248);
          }
        `}
      </style>
      
      <Calendar
        key={`calendar-${key}`}
        mode="single"
        selected={selectedDate}
        onSelect={onSelect}
        onMonthChange={handleMonthChange}
        month={calendarMonth}
        className={cn("rounded-md border shadow p-3 pointer-events-auto bg-card", className)}
        modifiers={{
          currentPeriod: (date) => isDateInCurrentPeriod(date),
          fertileWindow: (date) => isDateInFertileWindow(date),
          ovulation: (date) => isDateInOvulationPeriod(date),
          prediction: (date) => prediction ? isDateInPredictedPeriod(date) : false,
        }}
        modifiersClassNames={{
          currentPeriod: "current-period-day",
          fertileWindow: "fertile-window-day",
          ovulation: "ovulation-day", 
          prediction: "prediction-day",
        }}
        components={{
          DayContent: ({ date, ...props }) => (
            <div title={getDayDescription(date)} {...props}>
              {date.getDate()}
            </div>
          ),
        }}
      />
      
      <div className="text-sm text-muted-foreground">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 dark:bg-red-900 mr-2"></div>
            <span>Current Period</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 dark:bg-green-700 mr-2"></div>
            <span>Fertile Window</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-orange-400 dark:bg-orange-600 mr-2"></div>
            <span>Ovulation</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-pink-500 dark:bg-pink-700 mr-2"></div>
            <span>Predicted Period</span>
          </div>
        </div>
      </div>
    </div>
  );
}
