import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Calendar from "./pages/Calendar";
import Auth from "./pages/Auth";
import Planos from "./pages/Planos";
import Sucesso from "./pages/Sucesso";
import Obrigado from "./pages/Obrigado";
import PosPagamento from "./pages/PosPagamento";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/planos" element={<Planos />} />
            <Route path="/sucesso" element={<Sucesso />} />
            <Route path="/obrigado" element={<Obrigado />} />
            <Route path="/pos-pagamento" element={<PosPagamento />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
