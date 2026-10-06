import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AppProvider } from "./context/AppContext";
import { LanguageProvider } from "./context/LanguageContext";
import { SOCProvider } from "./context/SOCContext";
import { AuthProvider } from "./context/AuthContext";
import { AIProvider } from "./context/AIContext";
import { ProtectedRoute } from "./components/common/ProtectedRoute";

import Layout from "./layouts/Layout";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import DigitalTwin from "./pages/DigitalTwin";
import CyberDNAPage from "./pages/CyberDNAPage";
import AttackPathsPage from "./pages/AttackPathsPage";
import WhatIfPage from "./pages/WhatIfPage";
import Alerts from "./pages/Alerts";
import Incidents from "./pages/Incidents";
import AIAnalysis from "./pages/AIAnalysis";
import Response from "./pages/Response";
import Forensics from "./pages/Forensics";
import Reports from "./pages/Reports";
import ProfilePage from "./pages/ProfilePage";
import AuthorizationManagementPage from "./pages/AuthorizationManagementPage";

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AIProvider>
          <AppProvider>
            <SOCProvider>
              <BrowserRouter>
                <Routes>
                  {/* PUBLIC AUTH ROUTES */}
                  <Route path="/login" element={<AuthPage />} />
                  <Route path="/register" element={<AuthPage />} />

                  {/* PROTECTED SOC DASHBOARD ROUTES */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/digital-twin" element={<DigitalTwin />} />
                      <Route path="/alerts" element={<Alerts />} />
                      <Route path="/incidents" element={<Incidents />} />
                      <Route path="/ai-analysis" element={<AIAnalysis />} />
                      <Route path="/cyber-dna" element={<CyberDNAPage />} />
                      <Route path="/attack-paths" element={<AttackPathsPage />} />
                      <Route path="/what-if" element={<WhatIfPage />} />
                      <Route path="/response" element={<Response />} />
                      <Route path="/forensics" element={<Forensics />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/authorization" element={<AuthorizationManagementPage />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Route>
                  </Route>
                </Routes>
              </BrowserRouter>
            </SOCProvider>
          </AppProvider>
        </AIProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;