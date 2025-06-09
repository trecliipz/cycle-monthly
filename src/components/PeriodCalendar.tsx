
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  hasDataForDate,
  isDateInPredictedPeriod,
  isDateInOvulationPeriod,
  predictNextPeriod,
  getDataForDate
} from "@/utils/periodUtils";

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
  
  // Get prediction information
  const prediction = predictNextPeriod();
  
  // Helper function to check if a date has period flow data
  const hasActualPeriodFlow = (date: Date): boolean => {
    const data = getDataForDate(date);
    return data ? data.flow !== "none" : false;
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <style>
        {`
          .rdp-day {
            position: relative;
          }
          
          .period-day {
            background-color: #fef2f2 !important;
            color: #b91c1c !important;
            border-radius: 6px;
          }
          
          .period-day:hover {
            background-color: #fee2e2 !important;
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
          
          .period-day::after {
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
        mode="single"
        selected={selectedDate}
        onSelect={onSelect}
        onMonthChange={setMonth}
        month={month}
        className={cn("rounded-md border shadow p-3 pointer-events-auto", className)}
        modifiers={{
          period: (date) => hasActualPeriodFlow(date),
          ovulation: (date) => isDateInOvulationPeriod(date),
          prediction: (date) => prediction ? isDateInPredictedPeriod(date) : false,
        }}
        modifiersClassNames={{
          period: "period-day",
          ovulation: "ovulation-day", 
          prediction: "prediction-day",
        }}
      />
      
      <div className="text-sm text-muted-foreground">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span>Period</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
            <span>Ovulation</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-pink-600 mr-2"></div>
            <span>Predicted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
