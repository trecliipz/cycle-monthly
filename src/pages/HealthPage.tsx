
import { useState } from "react";
import { PeriodHealth } from "@/components/PeriodHealth";
import { Card } from "@/components/ui/card";

export default function HealthPage() {
  const [selectedDate] = useState<Date>(new Date());

  return (
    <div className="flex flex-col pb-20 px-4 space-y-5">
      <header className="mt-6 mb-2">
        <h1 className="text-2xl font-semibold text-center text-period-accent">Health & Wellness</h1>
      </header>

      <Card className="bg-white shadow-sm">
        <PeriodHealth date={selectedDate} />
      </Card>
    </div>
  );
}
