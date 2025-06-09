
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Activity } from "lucide-react";

export default function InsightsPage() {
  const [key, setKey] = useState(0);

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

  return (
    <div className="flex flex-col pb-20 px-4 space-y-5">
      <header className="mt-6 mb-2">
        <h1 className="text-2xl font-semibold text-center text-period-accent">Insights</h1>
      </header>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 rounded-xl bg-period-lavender/20 p-1">
          <TabsTrigger 
            value="history" 
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-period-accent data-[state=active]:shadow-sm flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
          <TabsTrigger 
            value="symptoms" 
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-period-accent data-[state=active]:shadow-sm flex items-center justify-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Symptoms</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-4">
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Period History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-6">
                Your period history and detailed cycle information will appear here as you log more data.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="symptoms" className="mt-4">
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Symptom Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-6">
                Your symptom frequency and patterns will be displayed here as you track more data.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
