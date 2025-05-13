
import { useState } from "react";
import { PeriodCalendar } from "@/components/PeriodCalendar";
import { PeriodForm } from "@/components/PeriodForm";
import { CycleStats } from "@/components/CycleStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Calendar, Heart, Baby } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-b from-white to-period-lavender/30 px-4 py-6 md:py-10 mx-auto max-w-7xl">
      <header className="text-center mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-period-pink to-period-dark bg-clip-text text-transparent animate-pulse-slow">
          Monthly
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">Your personal cycle companion</p>
      </header>

      <div className="relative max-w-md mx-auto mb-8 rounded-2xl bg-white/70 backdrop-blur-sm shadow-flo p-1">
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12 rounded-xl bg-period-lavender/20 p-1">
            <TabsTrigger 
              value="calendar"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-period-accent data-[state=active]:shadow-sm flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden md:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger 
              value="log" 
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-period-accent data-[state=active]:shadow-sm flex items-center justify-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden md:inline">Log</span>
            </TabsTrigger>
            <TabsTrigger 
              value="stats" 
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-period-accent data-[state=active]:shadow-sm flex items-center justify-center gap-2">
              <Baby className="h-4 w-4" />
              <span className="hidden md:inline">Cycle Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mx-auto mt-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
                  <PeriodCalendar 
                    key={`calendar-${key}`} 
                    selectedDate={selectedDate}
                    onSelect={handleDateSelect}
                    className="mx-auto max-w-sm"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="log" className="mx-auto mt-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <PeriodForm 
                selectedDate={selectedDate}
                onSave={handlePeriodSaved}
              />
            </div>
          </TabsContent>

          <TabsContent value="stats" className="mx-auto mt-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <CycleStats key={`stats-${key}`} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
