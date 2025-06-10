
import { useState } from "react";
import { PeriodForm } from "@/components/PeriodForm";
import { CycleSettings } from "@/components/CycleSettings";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

export default function LogPage() {
  const [selectedDate] = useState<Date>(new Date());
  
  const handlePeriodSaved = () => {
    toast.success(`Data saved for ${format(selectedDate, "MMMM d, yyyy")}`);
  };

  return (
    <div className="flex flex-col pb-20 px-4 space-y-5">
      <header className="mt-6 mb-2">
        <h1 className="text-2xl font-semibold text-center text-period-accent">Log Entry</h1>
      </header>

      <CycleSettings />

      <Card className="bg-white shadow-sm">
        <PeriodForm
          selectedDate={selectedDate}
          onSave={handlePeriodSaved}
        />
      </Card>
    </div>
  );
}
