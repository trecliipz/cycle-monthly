
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateForDisplay, getCycleLength, getPeriodLength, getLastPeriodStartDate, predictNextPeriod, setCycleLength, setPeriodLength, calculateAveragePeriodLength, savePeriodDay, getDefaultPeriodDay, FlowIntensity } from "@/utils/periodUtils";
import { Calendar as CalendarIcon, Settings } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export function CycleStats() {
  // Legacy component - redirect to enhanced version
  return (
    <div className="space-y-4">
      <div className="text-center p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700 mb-2">
          ✨ Enhanced cycle analysis is now available!
        </p>
        <Button asChild variant="outline" className="text-blue-700 border-blue-700">
          <Link to="/insights">View Enhanced Analytics</Link>
        </Button>
      </div>
      
      {/* Keep basic functionality for backward compatibility */}
      <Card className="w-full opacity-75">
        <CardHeader>
          <CardTitle className="text-period-accent flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5" />
            Basic Cycle Stats
          </CardTitle>
          <CardDescription>
            Upgrade to enhanced analytics for better insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            This view has been replaced with enhanced predictions. 
            Visit the Insights page for detailed analytics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
