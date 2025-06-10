
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Home as HomeIcon, 
  BarChart3 as InsightsIcon, 
  Settings as SettingsIcon, 
  PlusCircle as LogIcon,
  User as UserIcon
} from "lucide-react";

export function BottomNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [userName, setUserName] = useState<string>("");
  
  const isActive = (path: string) => currentPath === path;

  // Load user name from profile
  const loadUserName = () => {
    const savedProfile = localStorage.getItem("user_profile");
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        if (profile.name) {
          // Get first name only
          const firstName = profile.name.split(' ')[0];
          setUserName(firstName);
        } else {
          setUserName("");
        }
      } catch (error) {
        console.error("Failed to parse user profile:", error);
        setUserName("");
      }
    } else {
      setUserName("");
    }
  };

  useEffect(() => {
    loadUserName();
    
    // Listen for profile updates
    const handleProfileUpdate = () => {
      loadUserName();
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border h-16 flex items-center justify-around px-4 z-50">
      <Link
        to="/"
        className={`flex flex-col items-center justify-center space-y-1 ${
          isActive("/") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <HomeIcon size={20} />
        <span className="text-xs">Home</span>
      </Link>
      <Link
        to="/calendar"
        className={`flex flex-col items-center justify-center space-y-1 ${
          isActive("/calendar") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <CalendarIcon size={20} />
        <span className="text-xs">Calendar</span>
      </Link>
      <Link
        to="/log"
        className={`flex flex-col items-center justify-center space-y-1 ${
          isActive("/log") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <LogIcon size={20} />
        <span className="text-xs">Log</span>
      </Link>
      <Link
        to="/insights"
        className={`flex flex-col items-center justify-center space-y-1 ${
          isActive("/insights") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <InsightsIcon size={20} />
        <span className="text-xs">Insights</span>
      </Link>
      <Link
        to="/account"
        className={`flex flex-col items-center justify-center space-y-1 ${
          isActive("/account") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <UserIcon size={20} />
        <span className="text-xs">{userName || "Account"}</span>
      </Link>
    </nav>
  );
}
