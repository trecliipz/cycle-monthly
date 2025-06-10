import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  getAdvancedCycleAnalytics, 
  getAdvancedPrediction, 
  formatDateForDisplay,
  savePeriodDay,
  getDefaultPeriodDay,
  FlowIntensity,
  type CycleAnalytics,
  type AdvancedPredictionData
} from "@/utils/periodUtils";
import { Calendar as CalendarIcon, TrendingUp, Target, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export function EnhancedCycleStats() {
  const [periodStartDate, setPeriodStartDate] = useState("");
  const [analytics, setAnalytics] = useState<CycleAnalytics | null>(null);
  const [prediction, setPrediction] = useState<AdvancedPredictionData | null>(null);
  const [key, setKey] = useState(0);
  
  useEffect(() => {
    refreshStats();
  }, []);

  // Listen for cycle settings updates
  useEffect(() => {
    const handleCycleUpdate = () => {
      refreshStats();
    };

    window.addEventListener('cycleSettingsUpdated', handleCycleUpdate);
    
    return () => {
      window.removeEventListener('cycleSettingsUpdated', handleCycleUpdate);
    };
  }, []);
  
  const refreshStats = () => {
    const cycleAnalytics = getAdvancedCycleAnalytics();
    const enhancedPrediction = getAdvancedPrediction();
    
    setAnalytics(cycleAnalytics);
    setPrediction(enhancedPrediction);
  };

  const handlePeriodStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPeriodStartDate(e.target.value);
  };
  
  const handleSaveSettings = () => {
    if (periodStartDate && analytics) {
      const startDate = new Date(periodStartDate);
      
      if (!isNaN(startDate.getTime())) {
        // Create period days for the average period length
        for (let i = 0; i < analytics.averagePeriodLength; i++) {
          const periodDate = new Date(startDate);
          periodDate.setDate(startDate.getDate() + i);
          
          const periodDay = {
            ...getDefaultPeriodDay(periodDate),
            flow: i === 0 ? FlowIntensity.Heavy : (i < 2 ? FlowIntensity.Medium : FlowIntensity.Light)
          };
          
          savePeriodDay(periodDay);
        }
        
        setPeriodStartDate("");
      }
    }
    
    refreshStats();
    window.dispatchEvent(new CustomEvent('cycleSettingsUpdated'));
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  const getRegularityBadge = (isRegular: boolean, score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Very Regular</Badge>;
    if (score >= 60) return <Badge className="bg-blue-100 text-blue-800">Regular</Badge>;
    if (score >= 40) return <Badge className="bg-yellow-100 text-yellow-800">Somewhat Regular</Badge>;
    return <Badge className="bg-red-100 text-red-800">Irregular</Badge>;
  };
  
  return (
    <div className="space-y-4">
      {/* Main Stats Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-period-accent flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Enhanced Cycle Analysis
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/settings">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          </CardTitle>
          <CardDescription>
            Smart predictions based on your cycle patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Add Period */}
          <div className="space-y-2">
            <Label htmlFor="period-start-date">Quick Add Period Start Date</Label>
            <div className="flex gap-2">
              <Input
                id="period-start-date"
                type="date"
                value={periodStartDate}
                onChange={handlePeriodStartDateChange}
                className="flex-1"
              />
              <Button 
                onClick={handleSaveSettings}
                className="bg-period-accent hover:bg-period-dark text-white"
                disabled={!periodStartDate}
              >
                Add
              </Button>
            </div>
          </div>

          {analytics && (
            <>
              {/* Cycle Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Average Cycle</Label>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <span className="text-2xl font-bold text-period-accent">{analytics.averageCycleLength}</span>
                    <span className="text-sm text-muted-foreground ml-1">days</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Period Length</Label>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <span className="text-2xl font-bold text-period-accent">{analytics.averagePeriodLength}</span>
                    <span className="text-sm text-muted-foreground ml-1">days</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Cycle Range</Label>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <span className="text-lg font-bold text-period-accent">
                      {analytics.minCycleLength}-{analytics.maxCycleLength}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">days</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Total Cycles</Label>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <span className="text-2xl font-bold text-period-accent">{analytics.totalCycles}</span>
                    <span className="text-sm text-muted-foreground ml-1">tracked</span>
                  </div>
                </div>
              </div>

              {/* Regularity Analysis */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Cycle Regularity</Label>
                  {getRegularityBadge(analytics.isRegular, analytics.regularityScore)}
                </div>
                <Progress value={analytics.regularityScore} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {analytics.regularityScore}% of your cycles are within 3 days of your average
                  {analytics.totalCycles < 3 && " (Need more data for accurate analysis)"}
                </p>
              </div>
            </>
          )}

          {prediction && (
            <>
              {/* Prediction Confidence */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Prediction Confidence
                  </Label>
                  <Badge className={getConfidenceColor(prediction.confidence)}>
                    {prediction.confidence.toUpperCase()}
                  </Badge>
                </div>
                {analytics && (
                  <Progress value={analytics.predictionConfidence} className="h-2" />
                )}
                <p className="text-sm text-muted-foreground">
                  {analytics && analytics.predictionConfidence}% confidence based on your cycle history
                </p>
              </div>

              {/* Next Events */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Upcoming Events
                </h3>
                
                <div className="grid gap-3">
                  <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                    <div>
                      <p className="font-medium">Next Period</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateForDisplay(prediction.nextPeriodStart)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-period-accent">
                        {prediction.daysUntilPeriod} days
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium">Next Ovulation</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateForDisplay(prediction.nextOvulation)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-600">
                        {prediction.daysUntilOvulation} days
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Fertile Window</p>
                      <p className="text-sm text-muted-foreground">
                        {format(prediction.fertileWindowStart, 'MMM d')} - {format(prediction.fertileWindowEnd, 'MMM d')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {(!analytics || analytics.totalCycles === 0) && (
            <div className="text-center py-6 space-y-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
              <h3 className="font-medium">No Cycle Data Yet</h3>
              <p className="text-sm text-muted-foreground">
                Add your period start dates to get personalized predictions and insights.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
