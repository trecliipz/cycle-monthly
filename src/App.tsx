
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Initialize query client
const queryClient = new QueryClient();

// Create the main App component
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="top-center" />
      <Sonner 
        position="top-center"
        toastOptions={{
          style: {
            background: "white",
            color: "#7E69AB",
            border: "1px solid #E5DEFF",
            borderRadius: "0.75rem",
          }
        }}
      />
      <BrowserRouter>
        <div className="bg-gradient-to-b from-white via-period-lavender/10 to-period-softBlue/20 min-h-screen">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
