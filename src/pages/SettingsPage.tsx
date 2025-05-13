
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bell, Moon, User, Lock, HelpCircle, ChevronRight, Clock } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [periodReminder, setPeriodReminder] = useState(true);
  const [ovulationReminder, setOvulationReminder] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [appLock, setAppLock] = useState(false);

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="flex flex-col pb-20 px-4 space-y-5">
      <header className="mt-6 mb-2">
        <h1 className="text-2xl font-semibold text-center text-period-accent">Settings</h1>
      </header>

      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full justify-between">
            Account Details
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="period-reminder">Period Reminder</Label>
              <p className="text-xs text-muted-foreground">Get notified before your next period</p>
            </div>
            <Switch
              id="period-reminder"
              checked={periodReminder}
              onCheckedChange={setPeriodReminder}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ovulation-reminder">Ovulation Reminder</Label>
              <p className="text-xs text-muted-foreground">Get notified before your fertile window</p>
            </div>
            <Switch
              id="ovulation-reminder"
              checked={ovulationReminder}
              onCheckedChange={setOvulationReminder}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Cycle Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full justify-between">
            Default Cycle Length
            <span className="text-muted-foreground">28 days</span>
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode">Dark Mode</Label>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="app-lock">App Lock</Label>
              <p className="text-xs text-muted-foreground">Require authentication to open the app</p>
            </div>
            <Switch
              id="app-lock"
              checked={appLock}
              onCheckedChange={setAppLock}
            />
          </div>
          
          <Button variant="outline" className="w-full justify-between">
            Privacy Policy
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help & Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-between">
            FAQs
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="w-full justify-between">
            Contact Support
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="w-full justify-between">
            About Monthly
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <div className="text-center py-4 text-xs text-muted-foreground">
        Monthly v1.0.0
      </div>
    </div>
  );
}
