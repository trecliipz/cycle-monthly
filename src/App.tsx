
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNavigation } from "@/components/BottomNavigation";
import Index from "./pages/Index";
import Home from "./pages/Home";
import CalendarPage from "./pages/CalendarPage";
import LogPage from "./pages/LogPage";
import InsightsPage from "./pages/InsightsPage";
import SettingsPage from "./pages/SettingsPage";
import HealthPage from "./pages/HealthPage";
import AccountPage from "./pages/AccountPage";
import NotFound from "./pages/NotFound";

// Initialize query client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Create the main App component
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner 
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--background)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
            }
          }}
        />
        <BrowserRouter>
          <div className="bg-gradient-to-b from-white via-period-lavender/10 to-period-softBlue/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/log" element={<LogPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/health" element={<HealthPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/legacy" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNavigation />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
