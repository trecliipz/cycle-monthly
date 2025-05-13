
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { addDays, isSameDay, isWithinInterval, startOfDay } from "date-fns";
import {
  hasDataForDate,
  isDateInPredictedPeriod,
  predictNextPeriod
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
  
  const dayStyle = (date: Date) => {
    // Period logged days (show with a dot underneath)
    if (hasDataForDate(date)) {
      return "relative period-logged after:absolute after:period-dot after:left-1/2 after:-translate-x-1/2 after:bottom-1";
    }
    
    // Predicted period days (show with a lighter dot)
    if (prediction && isDateInPredictedPeriod(date)) {
      return "relative period-predicted after:absolute after:prediction-dot after:left-1/2 after:-translate-x-1/2 after:bottom-1";
    }
    
    return "";
  };
  
  return (
    <div className="flex flex-col space-y-4">
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
        }}
        modifiersClassNames={{
          period: "period-active",
          prediction: "bg-period-light text-period-text",
        }}
        components={{
          Day: ({ date, ...props }) => (
            <div className={cn(dayStyle(date), "h-9 w-9 p-0 font-normal aria-selected:opacity-100")}>
              {props.children}
            </div>
          ),
        }}
      />
      
      {prediction && (
        <div className="text-sm text-muted-foreground">
          <p className="flex items-center">
            <span className="prediction-dot mr-2"></span>
            Predicted period
          </p>
        </div>
      )}
    </div>
  );
}
