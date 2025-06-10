
import { useState, useEffect } from "react";
import { PeriodCalendar } from "@/components/PeriodCalendar";
import { PeriodForm } from "@/components/PeriodForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { getDataForDate, setManualPeriodStartDate } from "@/utils/periodUtils";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState(false);
  const [key, setKey] = useState(0);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setShowForm(false);
    }
  };

  const handlePeriodSaved = () => {
    setKey(prev => prev + 1);
    setShowForm(false);
  };

  const handleSetPeriodStart = () => {
    setManualPeriodStartDate(selectedDate);
    // Dispatch event to update all components
    window.dispatchEvent(new CustomEvent('cycleSettingsUpdated'));
    setKey(prev => prev + 1);
  };

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

  const periodData = getDataForDate(selectedDate);

  return (
    <div className="flex flex-col pb-20 px-4 space-y-5 bg-background min-h-screen">
      <header className="mt-6 mb-2">
        <h1 className="text-2xl font-semibold text-center text-foreground">Calendar</h1>
      </header>

      <Card className="bg-card shadow-sm p-4 border">
        <PeriodCalendar
          key={`calendar-${key}`}
          selectedDate={selectedDate}
          onSelect={handleDateSelect}
          className="mx-auto"
        />
      </Card>

      <Card className="bg-card shadow-sm p-4 border">
        {!showForm ? (
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-foreground">{format(selectedDate, 'MMMM d, yyyy')}</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSetPeriodStart}
                  className="text-primary border-primary hover:bg-primary/10"
                >
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Set as Period Start
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowForm(true)}
                  className="text-primary hover:bg-primary/10"
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  {periodData ? "Edit" : "Log"}
                </Button>
              </div>
            </div>
            
            {periodData ? (
              <div className="space-y-2 text-sm text-foreground">
                {periodData.flow !== "none" && (
                  <p><span className="font-medium">Flow:</span> {periodData.flow}</p>
                )}
                {periodData.symptoms.cramps !== "none" && (
                  <p><span className="font-medium">Cramps:</span> {periodData.symptoms.cramps}</p>
                )}
                {periodData.symptoms.headache !== "none" && (
                  <p><span className="font-medium">Headache:</span> {periodData.symptoms.headache}</p>
                )}
                {periodData.symptoms.mood !== "neutral" && (
                  <p><span className="font-medium">Mood:</span> {periodData.symptoms.mood}</p>
                )}
                {periodData.symptoms.notes && (
                  <p><span className="font-medium">Notes:</span> {periodData.symptoms.notes}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data logged for this day.</p>
            )}
          </div>
        ) : (
          <PeriodForm 
            selectedDate={selectedDate}
            onSave={handlePeriodSaved}
          />
        )}
      </Card>
    </div>
  );
}
