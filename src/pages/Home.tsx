
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  getDataForDate, 
  formatDateForDisplay, 
  predictNextPeriod, 
  getCycleLength,
  getCurrentCycleDay,
  isTodayPeriodDay
} from "@/utils/periodUtils";
import { DropletIcon, CalendarIcon, HeartIcon, InfoIcon } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  const today = new Date();
  const [userName] = useState("Friend"); // This could be fetched from user settings
  const [greeting, setGreeting] = useState("");
  const [cycleDay, setCycleDay] = useState<number | null>(null);
  const [cycleTotalDays, setCycleTotalDays] = useState(28); // Default
  const [currentPhase, setCurrentPhase] = useState("");
  const [periodPrediction, setPeriodPrediction] = useState<{ start: Date; end: Date } | null>(null);
  const [isPeriodDay, setIsPeriodDay] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    // Get cycle settings
    const totalDays = getCycleLength();
    setCycleTotalDays(totalDays);

    // Get current cycle day
    const currentDay = getCurrentCycleDay();
    setCycleDay(currentDay);

    // Check if today is a period day
    setIsPeriodDay(isTodayPeriodDay());

    // Get cycle predictions
    const prediction = predictNextPeriod();
    if (prediction) {
      setPeriodPrediction(prediction);
    }

    // Determine cycle phase (simplified)
    if (currentDay) {
      if (currentDay <= 5) {
        setCurrentPhase("Menstrual");
      } else if (currentDay <= 13) {
        setCurrentPhase("Follicular");
      } else if (currentDay <= 16) {
        setCurrentPhase("Ovulation");
      } else {
        setCurrentPhase("Luteal");
      }
    }
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
  
  // Get today's logged data
  const todayData = getDataForDate(today);
  
  return (
    <div className="flex flex-col pb-20 px-4 space-y-5 bg-background min-h-screen">
      <header className="mt-6 text-left">
        <h1 className="text-2xl font-semibold text-foreground">{greeting}, {userName}</h1>
        <p className="text-muted-foreground text-sm">{formatDateForDisplay(today)}</p>
        {isPeriodDay && (
          <p className="text-red-500 dark:text-red-400 text-sm font-medium">Today is a period day</p>
        )}
      </header>
      
      <div className="relative flex justify-center my-4">
        <div className="w-48 h-48 rounded-full border-8 border-primary/20 bg-card flex items-center justify-center relative shadow-lg">
          <div className="text-center">
            <p className="text-sm text-primary font-medium">{currentPhase} Phase</p>
            <h2 className="text-3xl font-bold text-foreground">Day {cycleDay || "?"}</h2>
            <p className="text-xs text-muted-foreground">of {cycleTotalDays}</p>
          </div>
        </div>
        
        {/* Phase indicators */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3">
          <div className={`h-6 w-6 rounded-full ${currentPhase === "Menstrual" ? "bg-red-500 dark:bg-red-400" : "bg-muted"} shadow-md`}></div>
        </div>
        <div className="absolute top-1/4 right-1/4 -translate-x-1/2 -translate-y-3">
          <div className={`h-6 w-6 rounded-full ${currentPhase === "Follicular" ? "bg-amber-500 dark:bg-amber-400" : "bg-muted"} shadow-md`}></div>
        </div>
        <div className="absolute bottom-1/4 right-1/4 -translate-x-1/2 translate-y-3">
          <div className={`h-6 w-6 rounded-full ${currentPhase === "Ovulation" ? "bg-pink-400 dark:bg-pink-300" : "bg-muted"} shadow-md`}></div>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-3">
          <div className={`h-6 w-6 rounded-full ${currentPhase === "Luteal" ? "bg-primary" : "bg-muted"} shadow-md`}></div>
        </div>
      </div>
      
      {periodPrediction && (
        <Card className="bg-card/80 backdrop-blur-sm border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Predictions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Next Period:</span>
              <span className="font-medium text-foreground">
                {format(periodPrediction.start, 'MMM d')} - {format(periodPrediction.end, 'MMM d')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Days Until:</span>
              <span className="font-medium text-foreground">
                {Math.max(0, Math.floor((periodPrediction.start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))} days
              </span>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className="bg-card/80 backdrop-blur-sm border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            <DropletIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
            Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayData ? (
            <div className="space-y-2">
              {todayData.flow !== "none" && (
                <p className="text-sm">
                  <span className="font-medium text-foreground">Flow:</span> <span className="text-muted-foreground">{todayData.flow}</span>
                </p>
              )}
              {todayData.symptoms.cramps !== "none" && (
                <p className="text-sm">
                  <span className="font-medium text-foreground">Cramps:</span> <span className="text-muted-foreground">{todayData.symptoms.cramps}</span>
                </p>
              )}
              {todayData.symptoms.mood !== "neutral" && (
                <p className="text-sm">
                  <span className="font-medium text-foreground">Mood:</span> <span className="text-muted-foreground">{todayData.symptoms.mood}</span>
                </p>
              )}
              {(!todayData || (todayData.flow === "none" && 
                  todayData.symptoms.cramps === "none" && 
                  todayData.symptoms.mood === "neutral")) && (
                <p className="text-sm text-muted-foreground">No data logged for today.</p>
              )}
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground mb-2">No data logged for today</p>
              <Button asChild variant="outline" className="text-primary border-primary hover:bg-primary/10">
                <Link to="/log">Log Today</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-card/80 backdrop-blur-sm border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            <HeartIcon className="h-5 w-5 text-primary" />
            Health Tip
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {currentPhase === "Menstrual" && "Try to get plenty of iron-rich foods like spinach and lentils during your period."}
            {currentPhase === "Follicular" && "Your energy is rising! Great time for starting new projects and high-intensity workouts."}
            {currentPhase === "Ovulation" && "Stay hydrated and consider foods rich in antioxidants during ovulation."}
            {currentPhase === "Luteal" && "Magnesium-rich foods like dark chocolate and nuts may help with PMS symptoms."}
          </p>
          <div className="mt-2 text-right">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary hover:bg-primary/10"
              asChild
            >
              <Link to="/health">
                <InfoIcon className="h-4 w-4 mr-1" />
                Learn More
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
