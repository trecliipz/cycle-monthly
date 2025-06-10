
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Settings } from "lucide-react";
import { toast } from "sonner";
import { getCycleLength, setCycleLength, getPeriodLength, setPeriodLength } from "@/utils/periodUtils";

export function CycleSettings() {
  const [cycleLength, setCycleLengthState] = useState<number>(28);
  const [periodLength, setPeriodLengthState] = useState<number>(5);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCycleLengthState(getCycleLength());
    setPeriodLengthState(getPeriodLength());
  }, []);

  const handleSaveCycleSettings = () => {
    if (cycleLength < 20 || cycleLength > 40) {
      toast.error("Cycle length must be between 20-40 days");
      return;
    }
    
    if (periodLength < 1 || periodLength > 14) {
      toast.error("Period length must be between 1-14 days");
      return;
    }

    setCycleLength(cycleLength);
    setPeriodLength(periodLength);
    
    // Dispatch event to update all components
    window.dispatchEvent(new CustomEvent('cycleSettingsUpdated'));
    
    toast.success("Cycle settings saved successfully");
  };

  return (
    <Card className="bg-card shadow-sm border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full p-4 flex items-center justify-between hover:bg-muted/50"
          >
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-primary" />
              <span className="text-lg font-medium">Cycle Settings</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cycle-length">Cycle Length (days)</Label>
                <Input
                  id="cycle-length"
                  type="number"
                  min="20"
                  max="40"
                  value={cycleLength}
                  onChange={(e) => setCycleLengthState(parseInt(e.target.value) || 28)}
                  className="text-center"
                />
                <p className="text-xs text-muted-foreground">Usually 21-35 days</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="period-length">Period Length (days)</Label>
                <Input
                  id="period-length"
                  type="number"
                  min="1"
                  max="14"
                  value={periodLength}
                  onChange={(e) => setPeriodLengthState(parseInt(e.target.value) || 5)}
                  className="text-center"
                />
                <p className="text-xs text-muted-foreground">Usually 3-7 days</p>
              </div>
            </div>
            
            <Button onClick={handleSaveCycleSettings} className="w-full">
              Save Settings
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
