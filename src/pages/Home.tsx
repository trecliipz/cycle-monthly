
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
import { getDataForDate, formatDateForDisplay, predictNextPeriod } from "@/utils/periodUtils";
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

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    // Get cycle predictions
    const prediction = predictNextPeriod();
    if (prediction) {
      setPeriodPrediction(prediction);
      
      // Calculate current day in cycle (simplified)
      // In a real app, this would be more sophisticated
      const lastPeriod = new Date(prediction.start);
      lastPeriod.setDate(lastPeriod.getDate() - cycleTotalDays);
      const daysSinceLastPeriod = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
      setCycleDay(daysSinceLastPeriod);
      
      // Determine cycle phase (simplified)
      if (daysSinceLastPeriod <= 5) {
        setCurrentPhase("Menstrual");
      } else if (daysSinceLastPeriod <= 13) {
        setCurrentPhase("Follicular");
      } else if (daysSinceLastPeriod <= 16) {
        setCurrentPhase("Ovulation");
      } else {
        setCurrentPhase("Luteal");
      }
    }
  }, []);
  
  // Get today's logged data
  const todayData = getDataForDate(today);
  
  return (
    <div className="flex flex-col pb-20 px-4 space-y-5">
      <header className="mt-6 text-left">
        <h1 className="text-2xl font-semibold text-period-accent">{greeting}, {userName}</h1>
        <p className="text-gray-500 text-sm">{formatDateForDisplay(today)}</p>
      </header>
      
      <div className="relative flex justify-center my-4">
        <div className="w-48 h-48 rounded-full border-8 border-period-lavender flex items-center justify-center relative">
          <div className="text-center">
            <p className="text-sm text-period-accent font-medium">{currentPhase} Phase</p>
            <h2 className="text-3xl font-bold text-period-dark">Day {cycleDay}</h2>
            <p className="text-xs text-gray-500">of {cycleTotalDays}</p>
          </div>
        </div>
        
        {/* Phase indicators */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3">
          <div className={`h-6 w-6 rounded-full ${currentPhase === "Menstrual" ? "bg-rose-500" : "bg-gray-200"} shadow-md`}></div>
        </div>
        <div className="absolute top-1/4 right-1/4 -translate-x-1/2 -translate-y-3">
          <div className={`h-6 w-6 rounded-full ${currentPhase === "Follicular" ? "bg-amber-500" : "bg-gray-200"} shadow-md`}></div>
        </div>
        <div className="absolute bottom-1/4 right-1/4 -translate-x-1/2 translate-y-3">
          <div className={`h-6 w-6 rounded-full ${currentPhase === "Ovulation" ? "bg-pink-400" : "bg-gray-200"} shadow-md`}></div>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-3">
          <div className={`h-6 w-6 rounded-full ${currentPhase === "Luteal" ? "bg-period-accent" : "bg-gray-200"} shadow-md`}></div>
        </div>
      </div>
      
      {periodPrediction && (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-period-pink" />
              Predictions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span>Next Period:</span>
              <span className="font-medium text-period-dark">
                {format(periodPrediction.start, 'MMM d')} - {format(periodPrediction.end, 'MMM d')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Days Until:</span>
              <span className="font-medium text-period-dark">
                {Math.max(0, Math.floor((periodPrediction.start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))} days
              </span>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <DropletIcon className="h-5 w-5 text-rose-500" />
            Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayData ? (
            <div className="space-y-2">
              {todayData.flow !== "none" && (
                <p className="text-sm">
                  <span className="font-medium">Flow:</span> {todayData.flow}
                </p>
              )}
              {todayData.symptoms.cramps !== "none" && (
                <p className="text-sm">
                  <span className="font-medium">Cramps:</span> {todayData.symptoms.cramps}
                </p>
              )}
              {todayData.symptoms.mood !== "neutral" && (
                <p className="text-sm">
                  <span className="font-medium">Mood:</span> {todayData.symptoms.mood}
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
              <Button asChild variant="outline" className="text-period-accent border-period-accent">
                <Link to="/log">Log Today</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-period-lavender/30 to-period-softBlue/30 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <HeartIcon className="h-5 w-5 text-period-pink" />
            Health Tip
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            {currentPhase === "Menstrual" && "Try to get plenty of iron-rich foods like spinach and lentils during your period."}
            {currentPhase === "Follicular" && "Your energy is rising! Great time for starting new projects and high-intensity workouts."}
            {currentPhase === "Ovulation" && "Stay hydrated and consider foods rich in antioxidants during ovulation."}
            {currentPhase === "Luteal" && "Magnesium-rich foods like dark chocolate and nuts may help with PMS symptoms."}
          </p>
          <div className="mt-2 text-right">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-period-accent hover:text-period-dark"
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
