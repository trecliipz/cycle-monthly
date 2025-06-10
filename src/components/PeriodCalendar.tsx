
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  isDateInPredictedPeriod,
  isDateInOvulationPeriod,
  isDateInFertileWindow,
  predictNextPeriod,
  getPeriodLength,
  getLastPeriodStartDate
} from "@/utils/periodUtils";
import { addDays, startOfDay } from "date-fns";

interface PeriodCalendarProps {
  selectedDate: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  className?: string;
}

export function PeriodCalendar({ 
  selectedDate, 
  onSelect,
  className 
}: PeriodCalendarProps) {
  const [month, setMonth] = useState<Date>(new Date());
  const [key, setKey] = useState(0);
  
  // Listen for cycle settings updates
  useEffect(() => {
    const handleCycleUpdate = () => {
      setKey(prev => prev + 1);
    };

    window.addEventListener('cycleSettingsUpdated', handleCycleUpdate);
    
    return () => {
      window.removeEventListener('cycleSettingsUpdated', handleCycleUpdate);
    };
  }, []);
  
  // Get prediction information (will recalculate when key changes)
  const prediction = predictNextPeriod();

  // Helper function to check if a date is within the current period based on last period start and period length
  const isDateInCurrentPeriod = (date: Date): boolean => {
    const lastStart = getLastPeriodStartDate();
    if (!lastStart) return false;
    
    const periodLength = getPeriodLength();
    const checkDate = startOfDay(date);
    const periodStart = startOfDay(lastStart);
    const periodEnd = startOfDay(addDays(lastStart, periodLength - 1));
    
    return checkDate >= periodStart && checkDate <= periodEnd;
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <style>
        {`
          .rdp-day {
            position: relative;
          }
          
          .current-period-day {
            background-color: rgb(252 165 165) !important;
            color: rgb(153 27 27) !important;
            border-radius: 6px;
          }
          
          .dark .current-period-day {
            background-color: rgb(127 29 29) !important;
            color: rgb(254 226 226) !important;
          }
          
          .current-period-day:hover {
            background-color: rgb(248 113 113) !important;
          }
          
          .dark .current-period-day:hover {
            background-color: rgb(153 27 27) !important;
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
            background-color: rgb(255 247 237) !important;
            color: rgb(194 65 12) !important;
            border-radius: 6px;
          }
          
          .dark .ovulation-day {
            background-color: rgb(154 52 18) !important;
            color: rgb(255 247 237) !important;
          }
          
          .ovulation-day:hover {
            background-color: rgb(254 215 170) !important;
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
          
          .current-period-day::after {
            content: '';
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%);
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: rgb(220 38 38);
          }
          
          .dark .current-period-day::after {
            background-color: rgb(254 226 226);
          }
          
          .fertile-window-day::after {
            content: '';
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%);
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: rgb(22 163 74);
          }
          
          .dark .fertile-window-day::after {
            background-color: rgb(220 252 231);
          }
          
          .ovulation-day::after {
            content: '';
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%);
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: rgb(234 88 12);
          }
          
          .dark .ovulation-day::after {
            background-color: rgb(255 247 237);
          }
          
          .prediction-day::after {
            content: '';
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%);
            width: 6px;
            height: 6px;
            border-radius: 50%;
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
        onMonthChange={setMonth}
        month={month}
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
      />
      
      <div className="text-sm text-muted-foreground">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-400 dark:bg-red-300 mr-2"></div>
            <span>Period Days</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 dark:bg-green-400 mr-2"></div>
            <span>Fertile Window</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-orange-500 dark:bg-orange-400 mr-2"></div>
            <span>Ovulation</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-pink-600 dark:bg-pink-400 mr-2"></div>
            <span>Predicted Period</span>
          </div>
        </div>
      </div>
    </div>
  );
}
