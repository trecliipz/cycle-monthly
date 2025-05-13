
import { Link, useLocation } from "react-router-dom";
import { Calendar, Home, PlusCircle, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: "/", icon: Home, label: "Today" },
    { path: "/calendar", icon: Calendar, label: "Calendar" },
    { path: "/log", icon: PlusCircle, label: "Log", primary: true },
    { path: "/insights", icon: BarChart3, label: "Insights" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white dark:bg-slate-900 shadow-lg">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-colors",
                isActive 
                  ? "text-period-accent" 
                  : "text-gray-500 hover:text-period-accent/70",
                item.primary && "relative"
              )}
            >
              {item.primary ? (
                <div className="bg-gradient-to-r from-period-pink to-period-dark rounded-full p-3 shadow-lg -mt-5 relative">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
              ) : (
                <item.icon className={cn("h-5 w-5", isActive && "text-period-accent")} />
              )}
              <span className={cn("text-xs mt-1", 
                isActive ? "font-medium" : "",
                item.primary && "sr-only"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
