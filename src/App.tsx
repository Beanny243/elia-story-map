import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import { useMobileApp } from "@/lib/mobile";
import Index from "./pages/Index";
import Trips from "./pages/Trips";
import CreateTrip from "./pages/CreateTrip";
import TripDetails from "./pages/TripDetails";
import MapScreen from "./pages/MapScreen";
import Memories from "./pages/Memories";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Subscription from "./pages/Subscription";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Welcome from "./pages/Welcome";
import AIItinerary from "./pages/AIItinerary";
import Community from "./pages/Community";
import SpottingJournal from "./pages/SpottingJournal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// Mobile app wrapper to handle native events
const MobileAppWrapper = ({ children }: { children: React.ReactNode }) => {
  const { appUrlOpen } = useMobileApp();

  useEffect(() => {
    if (appUrlOpen) {
      // Handle deep link
      console.log('Deep link received:', appUrlOpen);
      // The router will handle navigation based on the URL
    }
  }, [appUrlOpen]);

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <MobileAppWrapper>
            <Routes>
              <Route path="/welcome" element={<AuthRoute><Welcome /></AuthRoute>} />
              <Route path="/onboarding" element={<AuthRoute><Onboarding /></AuthRoute>} />
              <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/" element={<Index />} />
                <Route path="/trips" element={<Trips />} />
                <Route path="/trips/create" element={<CreateTrip />} />
                <Route path="/trips/:id" element={<TripDetails />} />
                <Route path="/trips/:id/edit" element={<CreateTrip />} />
                <Route path="/ai-itinerary" element={<AIItinerary />} />
                <Route path="/map" element={<MapScreen />} />
                <Route path="/memories" element={<Memories />} />
                <Route path="/community" element={<Community />} />
                <Route path="/spotting-journal" element={<SpottingJournal />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/subscription" element={<Subscription />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MobileAppWrapper>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
