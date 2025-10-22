import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import { Onboarding } from "./components/Onboarding";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Jobs from "./pages/Jobs";
import CalendarView from "./pages/CalendarView";
import Quotes from "./pages/Quotes";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";
import Leads from "./pages/Leads";
import Resources from "./pages/Resources";
import Contracts from "./pages/Contracts";
import Reports from "./pages/Reports";
import Templates from "./pages/Templates";
import Invoices from "./pages/Invoices";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ClientGallery from "./pages/ClientGallery";
import ContractSign from "./pages/ContractSign";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Onboarding />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            {/* Public Routes */}
            <Route path="/gallery/:token" element={<ClientGallery />} />
            <Route path="/contract/sign/:token" element={<ContractSign />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="clients" element={<Clients />} />
              <Route path="jobs" element={<Jobs />} />
              <Route path="calendar" element={<CalendarView />} />
              <Route path="leads" element={<Leads />} />
              <Route path="quotes" element={<Quotes />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="payments" element={<Payments />} />
              <Route path="resources" element={<Resources />} />
              <Route path="contracts" element={<Contracts />} />
              <Route path="reports" element={<Reports />} />
              <Route path="templates" element={<Templates />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
