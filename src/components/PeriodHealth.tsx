
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFoodRecommendationsForPhase, getHealthTipsForPhase } from "@/utils/periodUtils";
import { Apple, Carrot, Heart } from "lucide-react";

interface PeriodHealthProps {
  date?: Date;
}

export function PeriodHealth({ date = new Date() }: PeriodHealthProps) {
  const [foodRecommendations, setFoodRecommendations] = useState<string[]>([]);
  const [healthTips, setHealthTips] = useState<string[]>([]);
  
  useEffect(() => {
    setFoodRecommendations(getFoodRecommendationsForPhase(date));
    setHealthTips(getHealthTipsForPhase(date));
  }, [date]);
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-period-accent flex items-center">
          <Heart className="mr-2 h-5 w-5" />
          Period Health
        </CardTitle>
        <CardDescription>
          Tips and recommendations for your cycle phase
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="food" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="food" className="flex items-center gap-2">
              <Apple className="h-4 w-4" />
              <span className="hidden md:inline">Food</span>
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex items-center gap-2">
              <Carrot className="h-4 w-4" />
              <span className="hidden md:inline">Health Tips</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="food" className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-period-dark">Recommended Foods</h3>
              <ul className="space-y-2">
                {foodRecommendations.map((food, index) => (
                  <li key={index} className="flex items-start">
                    <div className="bg-period-light rounded-full p-1 mr-2 mt-0.5">
                      <Apple className="h-3 w-3 text-period-dark" />
                    </div>
                    <span className="text-sm">{food}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="tips" className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-period-dark">Health Tips</h3>
              <ul className="space-y-2">
                {healthTips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <div className="bg-period-light rounded-full p-1 mr-2 mt-0.5">
                      <Heart className="h-3 w-3 text-period-dark" />
                    </div>
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
