import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile"
import NotFound from "./pages/NotFound";
import ChallengeSelection from "./pages/ChallengeSelection";
import ChallengeWithBlockly from './pages/ChallengeWithBlockly';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/challenge" element={<ChallengeWithBlockly />} />
        <Route path="/challenge-selection" element={<ChallengeSelection />} />
        <Route path="/blockly/:challengeId" element={<ChallengeWithBlockly />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
