
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
            background-color: #fecaca !important;
            color: #991b1b !important;
            border-radius: 6px;
          }
          
          .current-period-day:hover {
            background-color: #fca5a5 !important;
          }
          
          .fertile-window-day {
            background-color: #dcfce7 !important;
            color: #166534 !important;
            border-radius: 6px;
          }
          
          .fertile-window-day:hover {
            background-color: #bbf7d0 !important;
          }
          
          .ovulation-day {
            background-color: #fff7ed !important;
            color: #c2410c !important;
            border-radius: 6px;
          }
          
          .ovulation-day:hover {
            background-color: #fed7aa !important;
          }
          
          .prediction-day {
            background-color: #fdf2f8 !important;
            color: #be185d !important;
            border-radius: 6px;
          }
          
          .prediction-day:hover {
            background-color: #fce7f3 !important;
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
            background-color: #dc2626;
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
            background-color: #16a34a;
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
            background-color: #ea580c;
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
            background-color: #db2777;
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
        className={cn("rounded-md border shadow p-3 pointer-events-auto", className)}
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
            <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
            <span>Period Days</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Fertile Window</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
            <span>Ovulation</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-pink-600 mr-2"></div>
            <span>Predicted Period</span>
          </div>
        </div>
      </div>
    </div>
  );
}
