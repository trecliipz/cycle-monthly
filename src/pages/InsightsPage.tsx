
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Calendar, Activity } from "lucide-react";
import { CycleStats } from "@/components/CycleStats";

export default function InsightsPage() {
  return (
    <div className="flex flex-col pb-20 px-4 space-y-5">
      <header className="mt-6 mb-2">
        <h1 className="text-2xl font-semibold text-center text-period-accent">Insights</h1>
      </header>

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12 rounded-xl bg-period-lavender/20 p-1">
          <TabsTrigger 
            value="stats"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-period-accent data-[state=active]:shadow-sm flex items-center justify-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Cycles</span>
          </TabsTrigger>
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

        <TabsContent value="stats" className="mt-4">
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Cycle Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CycleStats />
            </CardContent>
          </Card>
        </TabsContent>

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
