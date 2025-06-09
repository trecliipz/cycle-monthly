
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { 
  Bell, 
  Moon, 
  User, 
  Lock, 
  HelpCircle, 
  ChevronRight, 
  Clock, 
  Sun, 
  Shield, 
  ShieldCheck, 
  FileText, 
  Info 
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getCycleLength, getPeriodLength, setCycleLength, setPeriodLength } from "@/utils/periodUtils";

export default function SettingsPage() {
  const [periodReminder, setPeriodReminder] = useState(true);
  const [ovulationReminder, setOvulationReminder] = useState(true);
  const { isDark, toggleTheme } = useTheme();
  const [appLock, setAppLock] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(false);
  
  // Add state for cycle and period length
  const [cycleLength, setCycleLengthState] = useState(getCycleLength());
  const [periodLength, setPeriodLengthState] = useState(getPeriodLength());

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };
  
  const handleCycleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setCycleLengthState(value);
    }
  };
  
  const handlePeriodLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setPeriodLengthState(value);
    }
  };
  
  const saveCycleSettings = () => {
    console.log("Saving cycle settings:", { cycleLength, periodLength });
    
    // Save to localStorage
    setCycleLength(cycleLength);
    setPeriodLength(periodLength);
    
    console.log("Settings saved to localStorage");
    
    // Dispatch event to update other components including calendar and insights
    console.log("Dispatching cycleSettingsUpdated event");
    window.dispatchEvent(new CustomEvent('cycleSettingsUpdated'));
    
    toast.success("Cycle settings saved - all predictions updated");
  };

  return (
    <div className="flex flex-col pb-20 px-4 space-y-5">
      <header className="mt-6 mb-2">
        <h1 className="text-2xl font-semibold text-center text-period-accent">Settings</h1>
      </header>

      <Card className="bg-white shadow-sm dark:bg-gray-800 dark:text-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full justify-between" onClick={() => toast.info("Profile settings coming soon")}>
            Account Details
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm dark:bg-gray-800 dark:text-gray-100">
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
              <p className="text-xs text-muted-foreground dark:text-gray-300">Get notified before your next period</p>
            </div>
            <Switch
              id="period-reminder"
              checked={periodReminder}
              onCheckedChange={(checked) => {
                setPeriodReminder(checked);
                toast.info(`Period reminders ${checked ? "enabled" : "disabled"}`);
              }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ovulation-reminder">Ovulation Reminder</Label>
              <p className="text-xs text-muted-foreground dark:text-gray-300">Get notified before your fertile window</p>
            </div>
            <Switch
              id="ovulation-reminder"
              checked={ovulationReminder}
              onCheckedChange={(checked) => {
                setOvulationReminder(checked);
                toast.info(`Ovulation reminders ${checked ? "enabled" : "disabled"}`);
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm dark:bg-gray-800 dark:text-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Cycle Settings
          </CardTitle>
          <CardDescription>
            These settings will be used across all predictions and analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cycle-length">Default Cycle Length (days)</Label>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="h-9 w-9 p-0"
                onClick={() => {
                  if (cycleLength > 20) {
                    setCycleLengthState(cycleLength - 1);
                  }
                }}
              >-</Button>
              <Input
                id="cycle-length"
                type="number"
                value={cycleLength}
                onChange={handleCycleLengthChange}
                min={20}
                max={40}
                className="text-center"
              />
              <Button 
                variant="outline" 
                className="h-9 w-9 p-0"
                onClick={() => {
                  if (cycleLength < 40) {
                    setCycleLengthState(cycleLength + 1);
                  }
                }}
              >+</Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="period-length">Default Period Length (days)</Label>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="h-9 w-9 p-0"
                onClick={() => {
                  if (periodLength > 1) {
                    setPeriodLengthState(periodLength - 1);
                  }
                }}
              >-</Button>
              <Input
                id="period-length"
                type="number"
                value={periodLength}
                onChange={handlePeriodLengthChange}
                min={1}
                max={14}
                className="text-center"
              />
              <Button 
                variant="outline" 
                className="h-9 w-9 p-0"
                onClick={() => {
                  if (periodLength < 14) {
                    setPeriodLengthState(periodLength + 1);
                  }
                }}
              >+</Button>
            </div>
          </div>
          
          <Button 
            className="w-full" 
            variant="default"
            onClick={saveCycleSettings}
          >
            Save Cycle Settings
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm dark:bg-gray-800 dark:text-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-xs text-muted-foreground dark:text-gray-300">
                {isDark ? "Switch to light mode" : "Switch to dark mode"}
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={isDark}
              onCheckedChange={toggleTheme}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm dark:bg-gray-800 dark:text-gray-100">
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
              <p className="text-xs text-muted-foreground dark:text-gray-300">Require authentication to open the app</p>
            </div>
            <Switch
              id="app-lock"
              checked={appLock}
              onCheckedChange={(checked) => {
                setAppLock(checked);
                toast.info(`App lock ${checked ? "enabled" : "disabled"}`);
              }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="biometric-auth">Biometric Authentication</Label>
              <p className="text-xs text-muted-foreground dark:text-gray-300">Use Face ID or fingerprint to unlock</p>
            </div>
            <Switch
              id="biometric-auth"
              checked={biometricAuth}
              onCheckedChange={(checked) => {
                setBiometricAuth(checked);
                toast.info(`Biometric authentication ${checked ? "enabled" : "disabled"}`);
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="data-sharing">Anonymous Data Sharing</Label>
              <p className="text-xs text-muted-foreground dark:text-gray-300">Help improve the app by sharing anonymous usage data</p>
            </div>
            <Switch
              id="data-sharing"
              checked={dataSharing}
              onCheckedChange={(checked) => {
                setDataSharing(checked);
                toast.info(`Data sharing ${checked ? "enabled" : "disabled"}`);
              }}
            />
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                Privacy Policy
                <ChevronRight className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" /> Privacy Policy
                </DialogTitle>
                <DialogDescription>Last updated: May 14, 2025</DialogDescription>
              </DialogHeader>
              <div className="text-sm space-y-4">
                <p>
                  We are committed to protecting your personal information and your right to privacy. This Privacy Policy describes how we collect, use, and share your information when you use our period tracking app.
                </p>
                <h3 className="font-medium">Information We Collect</h3>
                <p>
                  We collect information that you provide directly to us, such as period dates, symptoms, moods, and other health data you choose to track. We also collect certain information automatically when you use our app, including device information and usage data.
                </p>
                <h3 className="font-medium">How We Use Your Information</h3>
                <p>
                  We use your information to provide and improve our services, personalize your experience, communicate with you, and develop new features. We may also use your information for research and analytics purposes, but only in an aggregated, anonymized form.
                </p>
                <h3 className="font-medium">How We Share Your Information</h3>
                <p>
                  We do not sell your personal information. We may share your information with third-party service providers who help us operate our app, but only as necessary to provide our services to you.
                </p>
                <h3 className="font-medium">Data Security</h3>
                <p>
                  We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm dark:bg-gray-800 dark:text-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Terms & Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                Terms of Service
                <ChevronRight className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Terms of Service
                </DialogTitle>
                <DialogDescription>Last updated: May 14, 2025</DialogDescription>
              </DialogHeader>
              <div className="text-sm space-y-4">
                <p>
                  By downloading or using the app, these terms will automatically apply to you – you should make sure therefore that you read them carefully before using the app.
                </p>
                <h3 className="font-medium">App Usage</h3>
                <p>
                  You're not allowed to copy or modify the app, any part of the app, or our trademarks in any way. You're not allowed to attempt to extract the source code of the app, and you also shouldn't try to translate the app into other languages or make derivative versions.
                </p>
                <h3 className="font-medium">Medical Disclaimer</h3>
                <p>
                  This app is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                </p>
                <h3 className="font-medium">Changes to Terms</h3>
                <p>
                  We may update our Terms of Service from time to time. Thus, you are advised to review this page periodically for any changes. We will notify you of any changes by posting the new Terms of Service on this page.
                </p>
                <h3 className="font-medium">Contact Us</h3>
                <p>
                  If you have any questions or suggestions about our Terms of Service, do not hesitate to contact us at support@monthlyapp.com.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm dark:bg-gray-800 dark:text-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help & Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                FAQs
                <ChevronRight className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" /> Frequently Asked Questions
                </DialogTitle>
              </DialogHeader>
              <div className="text-sm space-y-4">
                <div>
                  <h3 className="font-medium">How accurate are period predictions?</h3>
                  <p className="mt-1">
                    Period predictions become more accurate over time as the app learns your cycle patterns. Generally, after tracking for 3-4 cycles, predictions become more reliable.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Is my data private?</h3>
                  <p className="mt-1">
                    Yes, we take your privacy seriously. Your data is encrypted and stored securely. We do not sell your personal information to third parties.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Can I use this app for birth control?</h3>
                  <p className="mt-1">
                    This app is not intended to be used as a form of birth control. Please consult with a healthcare provider about reliable contraception methods.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">How do I backup my data?</h3>
                  <p className="mt-1">
                    You can enable automatic backups in your account settings. Your data will be securely stored in the cloud and can be restored if you change devices.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            className="w-full justify-between" 
            onClick={() => toast.success("Support request sent! We'll get back to you soon.")}
          >
            Contact Support
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                About Monthly
                <ChevronRight className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" /> About Monthly
                </DialogTitle>
              </DialogHeader>
              <div className="text-sm space-y-4">
                <p>
                  Monthly is designed to help you track your menstrual cycle, predict future periods, and understand your body better. Our mission is to empower users with accurate information about their reproductive health.
                </p>
                <p>
                  Our team of health experts and developers work together to provide a reliable, user-friendly period tracking experience.
                </p>
                <div className="pt-2">
                  <p className="font-medium">Monthly v1.0.0</p>
                  <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">© 2025 Monthly Health, Inc. All rights reserved.</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <div className="text-center py-4 text-xs text-muted-foreground dark:text-gray-400">
        Monthly v1.0.0
      </div>
    </div>
  );
}
