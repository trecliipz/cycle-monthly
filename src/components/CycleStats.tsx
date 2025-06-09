
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateForDisplay, getCycleLength, getPeriodLength, getLastPeriodStartDate, predictNextPeriod, setCycleLength, setPeriodLength, calculateAverageCycleLength, calculateAveragePeriodLength, savePeriodDay, getDefaultPeriodDay, FlowIntensity } from "@/utils/periodUtils";
import { Calendar as CalendarIcon, Settings } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export function CycleStats() {
  const [cycleLength, setCycleLengthState] = useState(getCycleLength());
  const [periodLength, setPeriodLengthState] = useState(getPeriodLength());
  const [periodStartDate, setPeriodStartDate] = useState("");
  const [lastPeriodDate, setLastPeriodDate] = useState<Date | null>(null);
  const [nextPeriodDates, setNextPeriodDates] = useState<{ start: Date, end: Date } | null>(null);
  
  useEffect(() => {
    refreshStats();
  }, []);

  // Listen for cycle settings updates from Settings page
  useEffect(() => {
    const handleCycleUpdate = () => {
      // Update state to reflect current stored values
      setCycleLengthState(getCycleLength());
      setPeriodLengthState(getPeriodLength());
      refreshStats();
    };

    window.addEventListener('cycleSettingsUpdated', handleCycleUpdate);
    
    return () => {
      window.removeEventListener('cycleSettingsUpdated', handleCycleUpdate);
    };
  }, []);
  
  const refreshStats = () => {
    // Always get the current stored values first
    const currentCycleLength = getCycleLength();
    const currentPeriodLength = getPeriodLength();
    
    setCycleLengthState(currentCycleLength);
    setPeriodLengthState(currentPeriodLength);
    
    // Get calculated average cycle length
    const avgCycleLength = calculateAverageCycleLength();
    if (avgCycleLength !== currentCycleLength) {
      setCycleLength(avgCycleLength);
      setCycleLengthState(avgCycleLength);
    }
    
    // Get calculated average period length
    const avgPeriodLength = calculateAveragePeriodLength();
    if (avgPeriodLength !== currentPeriodLength) {
      setPeriodLength(avgPeriodLength);
      setPeriodLengthState(avgPeriodLength);
    }
    
    // Get last period date
    setLastPeriodDate(getLastPeriodStartDate());
    
    // Get prediction
    setNextPeriodDates(predictNextPeriod());
  };

  const handlePeriodStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPeriodStartDate(e.target.value);
  };
  
  const handleSaveSettings = () => {
    console.log("Saving settings with period start date:", periodStartDate);
    
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
    
    // Dispatch event to update other components including calendar
    console.log("Dispatching cycleSettingsUpdated event");
    window.dispatchEvent(new CustomEvent('cycleSettingsUpdated'));
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-period-accent flex items-center justify-between">
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5" />
            Cycle Analysis
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Edit Settings
            </Link>
          </Button>
        </CardTitle>
        <CardDescription>
          View your cycle statistics and predictions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Current Cycle Length</Label>
            <div className="bg-muted rounded-lg p-3 text-center">
              <span className="text-2xl font-bold text-period-accent">{cycleLength}</span>
              <span className="text-sm text-muted-foreground ml-1">days</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Current Period Length</Label>
            <div className="bg-muted rounded-lg p-3 text-center">
              <span className="text-2xl font-bold text-period-accent">{periodLength}</span>
              <span className="text-sm text-muted-foreground ml-1">days</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="period-start-date">Add Period Start Date</Label>
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
          disabled={!periodStartDate}
        >
          Add Period Data
        </Button>
        
        <div className="pt-4 border-t space-y-4">
          <div>
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
        </div>
      </CardContent>
    </Card>
  );
}
