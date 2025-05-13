
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { 
  FlowIntensity, 
  Mood, 
  PeriodDay, 
  SymptomIntensity,
  formatDateForDisplay,
  getDataForDate,
  getDefaultPeriodDay,
  savePeriodDay
} from "@/utils/periodUtils";

interface PeriodFormProps {
  selectedDate: Date;
  onSave: () => void;
}

export function PeriodForm({ selectedDate, onSave }: PeriodFormProps) {
  const [periodData, setPeriodData] = useState<PeriodDay>(() => 
    getDataForDate(selectedDate) || getDefaultPeriodDay(selectedDate)
  );
  
  // Update form data when selectedDate changes
  useEffect(() => {
    setPeriodData(getDataForDate(selectedDate) || getDefaultPeriodDay(selectedDate));
  }, [selectedDate]);
  
  const handleSave = () => {
    savePeriodDay(periodData);
    onSave();
  };
  
  const handleFlowChange = (value: string) => {
    setPeriodData(prev => ({
      ...prev,
      flow: value as FlowIntensity
    }));
  };
  
  const handleSymptomChange = (symptom: keyof PeriodDay["symptoms"], value: string) => {
    if (symptom === "notes") {
      setPeriodData(prev => ({
        ...prev,
        symptoms: {
          ...prev.symptoms,
          notes: value
        }
      }));
    } else if (symptom === "mood") {
      setPeriodData(prev => ({
        ...prev,
        symptoms: {
          ...prev.symptoms,
          mood: value as Mood
        }
      }));
    } else {
      setPeriodData(prev => ({
        ...prev,
        symptoms: {
          ...prev.symptoms,
          [symptom]: value as SymptomIntensity
        }
      }));
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-period-accent">
          {formatDateForDisplay(selectedDate)}
        </CardTitle>
        <CardDescription>
          Log your period and symptoms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="flow" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="flow">Flow</TabsTrigger>
            <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
          </TabsList>
          
          <TabsContent value="flow" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3">Flow Intensity</h3>
              <RadioGroup 
                value={periodData.flow} 
                onValueChange={handleFlowChange}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={FlowIntensity.None} id="flow-none" />
                  <Label htmlFor="flow-none">None</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={FlowIntensity.Light} id="flow-light" />
                  <Label htmlFor="flow-light">Light</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={FlowIntensity.Medium} id="flow-medium" />
                  <Label htmlFor="flow-medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={FlowIntensity.Heavy} id="flow-heavy" />
                  <Label htmlFor="flow-heavy">Heavy</Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>
          
          <TabsContent value="symptoms" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3">Cramps</h3>
              <RadioGroup 
                value={periodData.symptoms.cramps} 
                onValueChange={(value) => handleSymptomChange("cramps", value)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={SymptomIntensity.None} id="cramps-none" />
                  <Label htmlFor="cramps-none">None</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={SymptomIntensity.Mild} id="cramps-mild" />
                  <Label htmlFor="cramps-mild">Mild</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={SymptomIntensity.Moderate} id="cramps-moderate" />
                  <Label htmlFor="cramps-moderate">Moderate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={SymptomIntensity.Severe} id="cramps-severe" />
                  <Label htmlFor="cramps-severe">Severe</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-3">Headache</h3>
              <RadioGroup 
                value={periodData.symptoms.headache} 
                onValueChange={(value) => handleSymptomChange("headache", value)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={SymptomIntensity.None} id="headache-none" />
                  <Label htmlFor="headache-none">None</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={SymptomIntensity.Mild} id="headache-mild" />
                  <Label htmlFor="headache-mild">Mild</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={SymptomIntensity.Moderate} id="headache-moderate" />
                  <Label htmlFor="headache-moderate">Moderate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={SymptomIntensity.Severe} id="headache-severe" />
                  <Label htmlFor="headache-severe">Severe</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-3">Mood</h3>
              <RadioGroup 
                value={periodData.symptoms.mood} 
                onValueChange={(value) => handleSymptomChange("mood", value)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={Mood.Neutral} id="mood-neutral" />
                  <Label htmlFor="mood-neutral">Neutral</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={Mood.Happy} id="mood-happy" />
                  <Label htmlFor="mood-happy">Happy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={Mood.Sad} id="mood-sad" />
                  <Label htmlFor="mood-sad">Sad</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={Mood.Irritable} id="mood-irritable" />
                  <Label htmlFor="mood-irritable">Irritable</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={Mood.Anxious} id="mood-anxious" />
                  <Label htmlFor="mood-anxious">Anxious</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={Mood.Tired} id="mood-tired" />
                  <Label htmlFor="mood-tired">Tired</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-3">Notes</h3>
              <Textarea 
                value={periodData.symptoms.notes} 
                onChange={(e) => handleSymptomChange("notes", e.target.value)}
                placeholder="Add any notes about today..."
                className="min-h-20"
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <Button 
          onClick={handleSave} 
          className="w-full mt-6 bg-period-dark hover:bg-period-accent"
        >
          Save
        </Button>
      </CardContent>
    </Card>
  );
}
