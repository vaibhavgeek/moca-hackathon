import { useState, useEffect, useRef } from "react";

interface NavBarLoginProps {
  isLoading: boolean;
  isInitialized: boolean;
  isLoggedIn: boolean;
  userAddress: string | null;
  onLogin: () => void;
  onLogout: () => void;
  currentEnv: string;
  setCurrentEnv: (env: string) => void;
  envOptions: { label: string; value: string }[];
}

const NavBarLogin = ({
  isLoading,
  isInitialized,
  isLoggedIn,
  userAddress,
  onLogin,
  onLogout,
  currentEnv,
  setCurrentEnv,
  envOptions,
}: NavBarLoginProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    onLogout();
    setShowDropdown(false);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  if (!isInitialized) {
    return (
      <div className="flex items-center">
        <div className="animate-spin h-4 w-4 text-amber-600 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <span className="text-sm text-gray-600">Initializing...</span>
      </div>
    );
  }

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {isLoggedIn ? (
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            {userAddress && <span className="text-xs font-mono text-gray-700 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-200">{formatAddress(userAddress)}</span>}
          </div>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-100 rounded-md transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      ) : (
        <button
          onClick={onLogin}
          disabled={isLoading}
          className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Connecting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Connect Wallet
            </>
          )}
        </button>
      )}

      {/* Dropdown menu for logged in users */}
      {showDropdown && isLoggedIn && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-elegant-lg py-1 z-50 border border-gray-100">
          <div className="px-4 py-3 text-sm text-gray-800 border-b border-gray-100 bg-gray-50">
            <div className="font-semibold text-gray-900">AIR Wallet</div>
            <div className="text-xs text-amber-600 font-medium">Connected</div>
            {userAddress && (
              <div className="mt-1">
                <div className="text-xs text-gray-600">Address:</div>
                <div className="text-xs font-mono text-gray-800 break-all bg-white px-2 py-1 rounded border border-gray-200 mt-1">{userAddress}</div>
              </div>
            )}
          </div>
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="text-xs text-gray-600 font-medium mb-2">AIRKit Environment:</div>
            <select
              className="text-xs px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 w-full bg-white hover:border-gray-400 transition-colors"
              value={currentEnv}
              onChange={(e) => setCurrentEnv(e.target.value)}
            >
              {envOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <button onClick={handleLogout} className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-medium">
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default NavBarLogin;
