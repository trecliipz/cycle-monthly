
import { useState, useEffect } from "react";
import { PeriodCalendar } from "@/components/PeriodCalendar";
import { PeriodForm } from "@/components/PeriodForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { format, addMonths } from "date-fns";
import { 
  getDataForDate, 
  setManualPeriodStartDate,
  getAdvancedPrediction,
  getPeriodLength,
  getCycleLength,
  getLastPeriodStartDate
} from "@/utils/periodUtils";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState(false);
  const [key, setKey] = useState(0);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"thisMonth" | "nextMonth" | "twoMonths">("thisMonth");

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
      console.log("Calendar: Cycle settings updated, refreshing...");
      setKey(prev => prev + 1);
    };

    window.addEventListener('cycleSettingsUpdated', handleCycleUpdate);
    
    return () => {
      window.removeEventListener('cycleSettingsUpdated', handleCycleUpdate);
    };
  }, []);

  const periodData = getDataForDate(selectedDate);
  const prediction = getAdvancedPrediction();
  const lastPeriodStart = getLastPeriodStartDate();
  
  console.log("Calendar Debug:", {
    lastPeriodStart,
    prediction,
    cycleLength: getCycleLength(),
    periodLength: getPeriodLength()
  });
  
  // Calculate confidence styling
  const getConfidenceBadge = () => {
    if (!prediction) return null;
    
    let color = "bg-red-100 text-red-800";
    if (prediction.confidence === "high") {
      color = "bg-green-100 text-green-800";
    } else if (prediction.confidence === "medium") {
      color = "bg-amber-100 text-amber-800";
    }
    
    return (
      <Badge variant="outline" className={`${color} ml-2`}>
        {prediction.confidence} confidence
      </Badge>
    );
  };

  // Get forecast information
  const getPredictionSummary = () => {
    if (!prediction) {
      return (
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
            <span className="font-medium text-amber-700">No Prediction Data Available</span>
          </div>
          <p className="text-muted-foreground">
            Add a period start date to see predictions. Use "Set as Period Start" below or add period data on the Log page.
          </p>
          <p className="text-sm text-muted-foreground">
            Current settings: {getCycleLength()} day cycle, {getPeriodLength()} day period
          </p>
        </div>
      );
    }
    
    const cycleLength = getCycleLength();
    const periodLength = getPeriodLength();
    
    return (
      <div className="mt-4 space-y-3 text-sm">
        <div className="flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 text-primary" />
          <span className="font-medium">Cycle Forecast</span>
          {getConfidenceBadge()}
        </div>
        <p>
          <span className="font-medium">Next period:</span>{" "}
          {format(prediction.nextPeriodStart, "MMMM d")} - {format(prediction.nextPeriodEnd, "MMMM d")}
          {prediction.daysUntilPeriod > 0 ? ` (in ${prediction.daysUntilPeriod} days)` : " (today)"}
        </p>
        <p>
          <span className="font-medium">Ovulation:</span>{" "}
          {format(prediction.nextOvulation, "MMMM d")}
          {prediction.daysUntilOvulation > 0 ? ` (in ${prediction.daysUntilOvulation} days)` : " (today)"}
        </p>
        <p>
          <span className="font-medium">Cycle length:</span> {cycleLength} days
        </p>
        <p>
          <span className="font-medium">Period length:</span> {periodLength} days
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col pb-20 px-4 space-y-5 bg-background min-h-screen">
      <header className="mt-6 mb-2">
        <h1 className="text-2xl font-semibold text-center text-foreground">Calendar</h1>
      </header>

      <Tabs 
        defaultValue="thisMonth" 
        value={viewMode} 
        onValueChange={(value) => setViewMode(value as "thisMonth" | "nextMonth" | "twoMonths")}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="thisMonth">This Month</TabsTrigger>
          <TabsTrigger value="nextMonth">Next Month</TabsTrigger>
          <TabsTrigger value="twoMonths">2 Month View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="thisMonth">
          <Card className="bg-card shadow-sm p-4 border">
            <PeriodCalendar
              key={`calendar-${key}`}
              selectedDate={selectedDate}
              onSelect={handleDateSelect}
              className="mx-auto"
              month={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="nextMonth">
          <Card className="bg-card shadow-sm p-4 border">
            <PeriodCalendar
              key={`calendar-next-${key}`}
              selectedDate={selectedDate}
              onSelect={handleDateSelect}
              className="mx-auto"
              month={addMonths(new Date(), 1)}
              onMonthChange={(date) => setCurrentMonth(date)}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="twoMonths" className="space-y-4">
          <Card className="bg-card shadow-sm p-4 border">
            <PeriodCalendar
              key={`calendar-current-${key}`}
              selectedDate={selectedDate}
              onSelect={handleDateSelect}
              className="mx-auto"
              month={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          </Card>
          
          <Card className="bg-card shadow-sm p-4 border">
            <PeriodCalendar
              key={`calendar-next-${key}`}
              selectedDate={selectedDate}
              onSelect={handleDateSelect}
              className="mx-auto"
              month={addMonths(currentMonth, 1)}
              onMonthChange={(date) => setCurrentMonth(addMonths(date, -1))}
            />
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-card shadow-sm p-4 border">
        {getPredictionSummary()}
        
        {!showForm ? (
          <div className="flex flex-col space-y-4 mt-4">
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
