
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { addDays, isSameDay, isWithinInterval, startOfDay } from "date-fns";
import {
  hasDataForDate,
  isDateInPredictedPeriod,
  isDateInOvulationPeriod,
  predictNextPeriod
} from "@/utils/periodUtils";
import { DayProps } from "react-day-picker";

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
  
  return (
    <div className="flex flex-col space-y-4">
      <style>
        {`
          .period-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #ef4444;
            display: inline-block;
          }
          
          .ovulation-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #f97316;
            display: inline-block;
          }
          
          .prediction-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #f472b6;
            display: inline-block;
          }
          
          .calendar-day-with-dot {
            position: relative;
          }
          
          .calendar-day-with-dot::after {
            content: '';
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%);
            width: 6px;
            height: 6px;
            border-radius: 50%;
          }
          
          .has-period::after {
            background-color: #ef4444;
          }
          
          .has-ovulation::after {
            background-color: #f97316;
          }
          
          .has-prediction::after {
            background-color: #f472b6;
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
          period: (date) => hasDataForDate(date),
          prediction: (date) => prediction ? isDateInPredictedPeriod(date) : false,
          ovulation: (date) => isDateInOvulationPeriod(date),
        }}
        modifiersClassNames={{
          period: "bg-red-50 text-red-700 has-period calendar-day-with-dot",
          prediction: "bg-pink-50 text-pink-700 has-prediction calendar-day-with-dot",
          ovulation: "bg-orange-50 text-orange-700 has-ovulation calendar-day-with-dot",
        }}
      />
      
      <div className="text-sm text-muted-foreground">
        <div className="flex flex-wrap gap-4">
          <p className="flex items-center">
            <span className="period-dot mr-2"></span>
            Period
          </p>
          <p className="flex items-center">
            <span className="ovulation-dot mr-2"></span>
            Ovulation
          </p>
          <p className="flex items-center">
            <span className="prediction-dot mr-2"></span>
            Predicted
          </p>
        </div>
      </div>
    </div>
  );
}
