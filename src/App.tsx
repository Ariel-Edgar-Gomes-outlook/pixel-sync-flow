import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";
import Layout from "./components/Layout";
import { Onboarding } from "./components/Onboarding";
import { SubscriptionBanner } from "./components/SubscriptionBanner";
import { useRealtimePushNotifications } from "./hooks/useRealtimePushNotifications";
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
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ClientGallery from "./pages/ClientGallery";
import ContractSign from "./pages/ContractSign";
import QuoteReview from "./pages/QuoteReview";
import Notifications from "./pages/Notifications";
import Landing from "./pages/Landing";
import AdminSubscribers from "./pages/AdminSubscribers";
import AdminLogin from "./pages/AdminLogin";
import TeamMembers from "./pages/TeamMembers";

const queryClient = new QueryClient();

// Componente interno para usar os hooks dentro dos providers
function AppContent() {
  // Hook que escuta notificações em tempo real e mostra notificações push
  useRealtimePushNotifications();

  return (
    <>
      <SubscriptionBanner />
      <Onboarding />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/gallery/:token" element={<ClientGallery />} />
        <Route path="/contract/sign/:token" element={<ContractSign />} />
        <Route path="/quote/review/:quoteId" element={<QuoteReview />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={
          <AdminAuthProvider>
            <AdminLogin />
          </AdminAuthProvider>
        } />
        <Route path="/admin/subscribers" element={
          <AdminAuthProvider>
            <AdminProtectedRoute>
              <AdminSubscribers />
            </AdminProtectedRoute>
          </AdminAuthProvider>
        } />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
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
          <Route path="team" element={<TeamMembers />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <SubscriptionProvider>
              <AppContent />
            </SubscriptionProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
