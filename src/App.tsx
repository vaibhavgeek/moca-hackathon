import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";
import CredentialIssuance from "./components/issuance/CredentialIssuance";
import CredentialVerification from "./components/verification/CredentialVerification";
import NavBarLogin from "./components/NavBarLogin";
import { AirService, BUILD_ENV, type AirEventListener } from "@mocanetwork/airkit";

// Get partner ID from environment variables
const NAV_PARTNER_ID = import.meta.env.VITE_NAV_PARTNER_ID || import.meta.env.VITE_ISSUER_PARTNER_ID || "your-partner-id";
const buildEnv = import.meta.env.VITE_AIRKIT_BUILD_ENV || BUILD_ENV.STAGING;
const enableLogging = true;

// Component to get current flow title
const FlowTitle = () => {
  const location = useLocation();

  if (location.pathname === "/issue") {
    return <span className="text-indigo-600">Credential Issuance</span>;
  } else if (location.pathname === "/verify") {
    return <span className="text-indigo-600">Credential Verification</span>;
  }

  return <span>AIR Credential Demo</span>;
};

function App() {
  const [airService, setAirService] = useState<AirService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  const initializeAirService = async () => {
    if (!NAV_PARTNER_ID || NAV_PARTNER_ID === "your-partner-id") {
      console.warn("No valid Partner ID configured for nav bar login");
      setIsInitialized(true); // Set to true to prevent infinite loading
      return;
    }

    try {
      const service = new AirService({ partnerId: NAV_PARTNER_ID });
      await service.init({ buildEnv, enableLogging, skipRehydration: false });
      setAirService(service);
      setIsInitialized(true);
      setIsLoggedIn(service.isLoggedIn);

      if (service.isLoggedIn && service.loginResult) {
        const result = service.loginResult;
        setUserAddress(result.abstractAccountAddress || null);
      }

      const eventListener: AirEventListener = (data) => {
        if (data.event === "logged_in") {
          setIsLoggedIn(true);
          if (data.result) {
            setUserAddress(data.result.abstractAccountAddress || null);
          }
        } else if (data.event === "logged_out") {
          setIsLoggedIn(false);
          setUserAddress(null);
        }
      };
      service.on(eventListener);
    } catch (err) {
      console.error("Failed to initialize AIRKit service in nav bar:", err);
      setIsInitialized(true); // Set to true to prevent infinite loading on error
    }
  };

  useEffect(() => {
    initializeAirService();
    return () => {
      if (airService) {
        airService.cleanUp();
      }
    };
  }, []);

  const handleLogin = async () => {
    if (!airService) return;
    setIsLoading(true);
    try {
      const loginResult = await airService.login();
      if (loginResult) {
        setUserAddress(loginResult.abstractAccountAddress || null);
      }
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!airService) return;
    try {
      await airService.logout();
      setUserAddress(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  <FlowTitle />
                </h1>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Partner ID:</span>
                  <span className="text-xs font-mono text-indigo-700 bg-indigo-50 px-2 py-1 rounded">{NAV_PARTNER_ID}</span>
                </div>
              </div>
              <div className="flex items-center space-x-8">
                <nav className="flex space-x-8">
                  <a
                    href="/issue"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  >
                    Issuance
                  </a>
                  <a
                    href="/verify"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  >
                    Verification
                  </a>
                </nav>
                <NavBarLogin
                  isLoading={isLoading}
                  isInitialized={isInitialized}
                  isLoggedIn={isLoggedIn}
                  userAddress={userAddress}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <Routes>
            {/* Redirect root to /issue */}
            <Route path="/" element={<Navigate to="/issue" replace />} />

            {/* Issuance Flow */}
            <Route path="/issue" element={<CredentialIssuance airService={airService} />} />

            {/* Verification Flow */}
            <Route path="/verify" element={<CredentialVerification airService={airService} />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-gray-500 text-sm">Powered by AIR Credential SDK</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
