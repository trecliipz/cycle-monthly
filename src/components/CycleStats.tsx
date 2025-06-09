
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateForDisplay, getCycleLength, getPeriodLength, getLastPeriodStartDate, predictNextPeriod, setCycleLength, setPeriodLength, calculateAverageCycleLength, calculateAveragePeriodLength, savePeriodDay, getDefaultPeriodDay, FlowIntensity } from "@/utils/periodUtils";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export function CycleStats() {
  const [cycleLength, setCycleLengthState] = useState(getCycleLength());
  const [periodLength, setPeriodLengthState] = useState(getPeriodLength());
  const [periodStartDate, setPeriodStartDate] = useState("");
  const [lastPeriodDate, setLastPeriodDate] = useState<Date | null>(null);
  const [nextPeriodDates, setNextPeriodDates] = useState<{ start: Date, end: Date } | null>(null);
  const [key, setKey] = useState(0);
  
  useEffect(() => {
    refreshStats();
  }, [key]);

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
  
  const refreshStats = () => {
    // Get calculated average cycle length
    const avgCycleLength = calculateAverageCycleLength();
    if (avgCycleLength !== getCycleLength()) {
      setCycleLength(avgCycleLength);
      setCycleLengthState(avgCycleLength);
    }
    
    // Get calculated average period length
    const avgPeriodLength = calculateAveragePeriodLength();
    if (avgPeriodLength !== getPeriodLength()) {
      setPeriodLength(avgPeriodLength);
      setPeriodLengthState(avgPeriodLength);
    }
    
    // Get last period date
    setLastPeriodDate(getLastPeriodStartDate());
    
    // Get prediction
    setNextPeriodDates(predictNextPeriod());
  };
  
  const handleCycleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setCycleLengthState(value);
    }
  };
  
  const handlePeriodLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setPeriodLengthState(value);
    }
  };

  const handlePeriodStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPeriodStartDate(e.target.value);
  };
  
  const handleSaveSettings = () => {
    console.log("Saving settings with period start date:", periodStartDate);
    
    setCycleLength(cycleLength);
    setPeriodLength(periodLength);
    
    // Save period start date if provided
    if (periodStartDate) {
      const startDate = new Date(periodStartDate);
      console.log("Parsed start date:", startDate);
      
      if (!isNaN(startDate.getTime())) {
        console.log("Creating period days for length:", periodLength);
        
        // Create period days for the specified period length
        for (let i = 0; i < periodLength; i++) {
          const periodDate = new Date(startDate);
          periodDate.setDate(startDate.getDate() + i);
          
          const periodDay = {
            ...getDefaultPeriodDay(periodDate),
            flow: i === 0 ? FlowIntensity.Heavy : (i < 2 ? FlowIntensity.Medium : FlowIntensity.Light)
          };
          
          console.log("Saving period day:", periodDate, periodDay);
          savePeriodDay(periodDay);
        }
        
        // Clear the input after saving
        setPeriodStartDate("");
        console.log("Period start date cleared");
      } else {
        console.error("Invalid date provided:", periodStartDate);
      }
    }
    
    refreshStats();
    
    // Dispatch event to update other components
    console.log("Dispatching cycleSettingsUpdated event");
    window.dispatchEvent(new CustomEvent('cycleSettingsUpdated'));
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-period-accent flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5" />
          Cycle Information
        </CardTitle>
        <CardDescription>
          View your cycle statistics and predictions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cycle-length">Cycle Length (days)</Label>
            <Input
              id="cycle-length"
              type="number"
              value={cycleLength}
              onChange={handleCycleLengthChange}
              min={1}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="period-length">Period Length (days)</Label>
            <Input
              id="period-length"
              type="number"
              value={periodLength}
              onChange={handlePeriodLengthChange}
              min={1}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="period-start-date">Period Start Date</Label>
          <Input
            id="period-start-date"
            type="date"
            value={periodStartDate}
            onChange={handlePeriodStartDateChange}
            className="w-full"
            placeholder="Select start date"
          />
        </div>
        
        <Button 
          onClick={handleSaveSettings}
          className="w-full bg-period-accent hover:bg-period-dark text-white"
        >
          Save Settings
        </Button>
        
        <div className="pt-4 border-t">
          <h3 className="font-medium mb-2">Last Period</h3>
          <p className="text-muted-foreground">
            {lastPeriodDate 
              ? formatDateForDisplay(lastPeriodDate)
              : "No period data recorded yet"}
          </p>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Next Period (Predicted)</h3>
          <p className="text-muted-foreground">
            {nextPeriodDates 
              ? `${formatDateForDisplay(nextPeriodDates.start)} - ${formatDateForDisplay(nextPeriodDates.end)}`
              : "Not enough data for prediction"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
