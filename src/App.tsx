import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import "./App.css";
import CredentialIssuance from "./components/issuance/CredentialIssuance";
import CredentialVerification from "./components/verification/CredentialVerification";
import CreateIdentity from "./components/CreateIdentity";
import ChatKafka from "./components/ChatKafka";
import NavBarLogin from "./components/NavBarLogin";
import { AirService, BUILD_ENV, type AirEventListener, type BUILD_ENV_TYPE } from "@mocanetwork/airkit";
import { getEnvironmentConfig, type EnvironmentConfig } from "./config/environments";

// Get partner IDs from environment variables
const ISSUER_PARTNER_ID =  "1787f1aa-8da9-42ae-9336-fe9bf2005f86";
const VERIFIER_PARTNER_ID = "1787f1aa-8da9-42ae-9336-fe9bf2005f86";
const enableLogging = true;

const ENV_OPTIONS = [
  { label: "Staging", value: BUILD_ENV.STAGING },
  { label: "Sandbox", value: BUILD_ENV.SANDBOX },
];

// Component to get current flow title
const FlowTitle = () => {
  return <span className="text-brand-600">Welcome to MocaVerse University</span>;
};

// Function to get default partner ID based on current route
const getDefaultPartnerId = (pathname: string): string => {
  if (pathname === "/issue") {
    return ISSUER_PARTNER_ID;
  } else if (pathname === "/verify") {
    return VERIFIER_PARTNER_ID;
  }
  return ISSUER_PARTNER_ID; // Default to issuer for root route
};

function AppRoutes({
  airService,
  isInitialized,
  isLoading,
  isLoggedIn,
  userAddress,
  handleLogin,
  handleLogout,
  currentEnv,
  setCurrentEnv,
  partnerId,
  setPartnerId,
  environmentConfig,
}: {
  airService: AirService | null;
  isInitialized: boolean;
  isLoading: boolean;
  isLoggedIn: boolean;
  userAddress: string | null;
  handleLogin: () => void;
  handleLogout: () => void;
  currentEnv: BUILD_ENV_TYPE;
  setCurrentEnv: (env: string) => void;
  partnerId: string;
  setPartnerId: (partnerId: string) => void;
  environmentConfig: EnvironmentConfig;
}) {
  const location = useLocation();

  // Update partner ID when route changes
  useEffect(() => {
    const defaultPartnerId = getDefaultPartnerId(location.pathname);
    setPartnerId(defaultPartnerId);
  }, [location.pathname, setPartnerId]);

  return (
    <div
      className={
        "min-h-screen " +
        (location.pathname.startsWith("/issue")
          ? "bg-gradient-to-br from-blue-50 to-brand-100"
          : location.pathname.startsWith("/verify")
          ? "bg-gradient-to-br from-verify-50 to-verify-200"
          : "bg-gradient-to-br from-gray-50 to-gray-200")
      }
    >
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full sm:max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-16 gap-2 sm:gap-0 py-2 sm:py-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                <FlowTitle />
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-8 w-full sm:w-auto">
              {isLoggedIn && (
                <nav className="flex flex-row space-x-2 sm:space-x-8 w-full sm:w-auto">
                  <Link
                    to="/create-identity"
                    className="flex-1 sm:flex-none px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-center"
                  >
                    Create Identity
                  </Link>
                  <Link
                    to="/chat"
                    className="flex-1 sm:flex-none px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-center"
                  >
                    Chat
                  </Link>
                </nav>
              )}
              <div className="w-full sm:w-auto">
                <NavBarLogin
                  isLoading={isLoading}
                  isInitialized={isInitialized}
                  isLoggedIn={isLoggedIn}
                  userAddress={userAddress}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                  currentEnv={currentEnv}
                  setCurrentEnv={(env) => setCurrentEnv(env as BUILD_ENV_TYPE)}
                  envOptions={ENV_OPTIONS}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Routes>
          {/* Redirect root to /create-identity */}
          <Route path="/" element={<Navigate to="/create-identity" replace />} />

          {/* Create Identity Flow */}
          <Route
            path="/create-identity"
            element={
              <CreateIdentity
                airService={airService}
                isLoggedIn={isLoggedIn}
                airKitBuildEnv={currentEnv}
                partnerId={partnerId}
                environmentConfig={environmentConfig}
              />
            }
          />

          {/* Chat Flow */}
          <Route
            path="/chat"
            element={
              <ChatKafka 
                isLoggedIn={isLoggedIn}
                airService={airService}
                airKitBuildEnv={currentEnv}
                partnerId={partnerId}
                environmentConfig={environmentConfig}
              />
            }
          />

          {/* Legacy Issuance Flow */}
          <Route
            path="/issue"
            element={
              <CredentialIssuance
                airService={airService}
                isLoggedIn={isLoggedIn}
                airKitBuildEnv={currentEnv}
                partnerId={partnerId}
                environmentConfig={environmentConfig}
              />
            }
          />

          {/* Legacy Verification Flow */}
          <Route
            path="/verify"
            element={
              <CredentialVerification
                airService={airService}
                isLoggedIn={isLoggedIn}
                airKitBuildEnv={currentEnv}
                partnerId={partnerId}
                environmentConfig={environmentConfig}
              />
            }
          />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-full sm:max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
          <p className="text-center text-gray-500 text-xs sm:text-sm">Powered by AIR Credential SDK</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const [airService, setAirService] = useState<AirService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [currentEnv, setCurrentEnv] = useState<BUILD_ENV_TYPE>(BUILD_ENV.SANDBOX);
  const [partnerId, setPartnerId] = useState<string>(ISSUER_PARTNER_ID);

  // Get environment config based on current environment
  const environmentConfig = getEnvironmentConfig(currentEnv);

  const initializeAirService = async (env: BUILD_ENV_TYPE = currentEnv, partnerIdToUse: string = partnerId) => {
    if (!partnerIdToUse || partnerIdToUse === "your-partner-id") {
      console.warn("No valid Partner ID configured for nav bar login");
      setIsInitialized(true); // Set to true to prevent infinite loading
      return;
    }

    try {
      const service = new AirService({ partnerId: partnerIdToUse });
      await service.init({ buildEnv: env as (typeof BUILD_ENV)[keyof typeof BUILD_ENV], enableLogging, skipRehydration: false });
      setAirService(service);
      setIsInitialized(true);
      setIsLoggedIn(service.isLoggedIn);

      if (service.isLoggedIn && service.loginResult) {
        const result = service.loginResult;
        console.log("result @ initializeAirService", result);
        if (result.abstractAccountAddress) {
          setUserAddress(result.abstractAccountAddress || null);
        } else {
          console.log("no abstractAccountAddress @ initializeAirService");
          const accounts = await airService?.provider.request({ method: "eth_accounts", params: [] });

          console.log("accounts @ initializeAirService", accounts, airService?.provider);
          setUserAddress(Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null);
        }
      }

      const eventListener: AirEventListener = async (data) => {
        if (data.event === "logged_in") {
          setIsLoggedIn(true);
          if (data.result.abstractAccountAddress) {
            setUserAddress(data.result.abstractAccountAddress || null);
          } else {
            const accounts = await airService?.provider.request({ method: "eth_accounts", params: [] });
            setUserAddress(Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null);
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

  // Re-initialize AIRKit when partner ID or environment changes
  useEffect(() => {
    initializeAirService(currentEnv, partnerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEnv, partnerId]);

  useEffect(() => {
    // Only run on mount for initial load
    // (the above effect will handle env and partner ID changes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    initializeAirService(currentEnv, partnerId);
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

      if (loginResult.abstractAccountAddress) {
        setUserAddress(loginResult.abstractAccountAddress || null);
      } else {
        const accounts = await airService?.provider.request({ method: "eth_accounts", params: [] });
        setUserAddress(Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null);
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
      <AppRoutes
        airService={airService}
        isInitialized={isInitialized}
        isLoading={isLoading}
        isLoggedIn={isLoggedIn}
        userAddress={userAddress}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        currentEnv={currentEnv}
        setCurrentEnv={(env) => setCurrentEnv(env as BUILD_ENV_TYPE)}
        partnerId={partnerId}
        setPartnerId={setPartnerId}
        environmentConfig={environmentConfig}
      />
    </Router>
  );
}

export default App;
