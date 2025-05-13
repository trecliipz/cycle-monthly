
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
  
  const dayStyle = (date: Date) => {
    // Period logged days (show with a red dot)
    if (hasDataForDate(date)) {
      return "relative period-logged after:absolute after:period-dot after:left-1/2 after:-translate-x-1/2 after:bottom-1";
    }
    
    // Ovulation days (show with a pink dot)
    if (isDateInOvulationPeriod(date)) {
      return "relative ovulation-day after:absolute after:ovulation-dot after:left-1/2 after:-translate-x-1/2 after:bottom-1";
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
          ovulation: (date) => isDateInOvulationPeriod(date),
        }}
        modifiersClassNames={{
          period: "period-active",
          prediction: "bg-period-light text-period-text",
          ovulation: "bg-ovulation-light text-ovulation-text",
        }}
        components={{
          Day: (props: DayProps) => {
            // Access the date property directly from props
            const { date } = props;
            
            // In react-day-picker v8+, we need to display the day number from the date
            const dayNumber = date.getDate();
            
            return (
              <div className={cn(dayStyle(date), "h-9 w-9 p-0 font-normal aria-selected:opacity-100")}>
                {dayNumber}
              </div>
            );
          },
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
