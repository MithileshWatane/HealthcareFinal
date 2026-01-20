import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute.tsx";
import LandingPage from "./pages/LandingPage";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Chatbot from "./pages/Chatbot";
import SkinDetection from "./pages/SkinDetection";
import ReportScanning from "./pages/ReportScanning";
import Appointments from "./pages/Appointments";
import HealthPrediction from "./pages/HealthPrediction";
import VoiceConsultation from "./pages/VoiceConsultation";
import HealthRecords from "./pages/HealthRecords";
import Alerts from "./pages/Alerts";
import MentalHealth from "./pages/MentalHealth";
import Games from "./pages/Games";
import SignalAnalysis from "./pages/SignalAnalysis";
import CancerDetection from "./pages/CancerDetection";
import Lifestyle from "./pages/Lifestyle";
import NotFound from "./pages/NotFound";
import CompleteProfile from "./pages/complete-profile";
import PatientQRCode from "./pages/PatientQRCode";
import PatientPage from "./pages/PatientPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Protected Routes - Require Authentication */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chatbot"
              element={
                <ProtectedRoute>
                  <Chatbot />
                </ProtectedRoute>
              }
            />
            <Route
              path="/skin-detection"
              element={
                <ProtectedRoute>
                  <SkinDetection />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-scanning"
              element={
                <ProtectedRoute>
                  <ReportScanning />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <Appointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/health-prediction"
              element={
                <ProtectedRoute>
                  <HealthPrediction />
                </ProtectedRoute>
              }
            />
            <Route
              path="/voice-consultation"
              element={
                <ProtectedRoute>
                  <VoiceConsultation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/health-records"
              element={
                <ProtectedRoute>
                  <HealthRecords />
                </ProtectedRoute>
              }
            />
            <Route
              path="/alerts"
              element={
                <ProtectedRoute>
                  <Alerts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mental-health"
              element={
                <ProtectedRoute>
                  <MentalHealth />
                </ProtectedRoute>
              }
            />
            <Route
              path="/games"
              element={
                <ProtectedRoute>
                  <Games />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signal-analysis"
              element={
                <ProtectedRoute>
                  <SignalAnalysis />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cancer-detection"
              element={
                <ProtectedRoute>
                  <CancerDetection />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lifestyle"
              element={
                <ProtectedRoute>
                  <Lifestyle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/complete-profile"
              element={
                <ProtectedRoute>
                  <CompleteProfile />
                </ProtectedRoute>
              }
            />

            <Route path="patient/:id" element={<PatientPage />} />
            <Route path="/my-qr" element={<PatientQRCode />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;