
import { useState, useEffect } from "react";
import { PeriodCalendar } from "@/components/PeriodCalendar";
import { PeriodForm } from "@/components/PeriodForm";
import { CycleStats } from "@/components/CycleStats";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [key, setKey] = useState(0); // For forcing re-renders

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handlePeriodSaved = () => {
    setKey(prev => prev + 1); // Force re-render to update calendar
    toast.success("Period data saved successfully");
  };

  return (
    <div className="min-h-screen px-4 py-8 md:py-12 mx-auto max-w-7xl">
      <header className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-period-accent mb-2">Bloom</h1>
        <p className="text-muted-foreground">Simple Period Tracking</p>
      </header>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="stats">Cycle Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mx-auto">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
            <div className="flex flex-col space-y-6 md:col-span-1 lg:col-span-2">
              <PeriodCalendar 
                key={`calendar-${key}`} 
                selectedDate={selectedDate}
                onSelect={handleDateSelect}
                className="mx-auto max-w-sm"
              />
            </div>

            <div className="md:col-span-1 lg:col-span-3">
              <PeriodForm 
                selectedDate={selectedDate}
                onSave={handlePeriodSaved}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <div className="max-w-md mx-auto">
            <CycleStats key={`stats-${key}`} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
