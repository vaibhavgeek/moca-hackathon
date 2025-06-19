import { useState, useEffect, useRef } from "react";
import { AirCredentialWidget, type QueryRequest, type VerificationResults } from "@mocanetwork/air-credential-sdk";
import "@mocanetwork/air-credential-sdk/dist/style.css";

// Environment variables for configuration
const WIDGET_ENV = import.meta.env.VITE_WIDGET_ENV || "https://widget.air.xyz";
const THEME = import.meta.env.VITE_THEME || "light";
const LOCALE = import.meta.env.VITE_LOCALE || "en";

const CredentialVerification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const widgetRef = useRef<AirCredentialWidget | null>(null);

  // Configuration - these would typically come from environment variables or API
  const [config, setConfig] = useState({
    verifierAuth: import.meta.env.VITE_VERIFIER_AUTH_TOKEN || "your-verifier-auth-token",
    programId: import.meta.env.VITE_PROGRAM_ID || "program-123",
    projectName: import.meta.env.VITE_PROJECT_NAME || "AirCredentialSdkDemo",
    projectLogo: import.meta.env.VITE_PROJECT_LOGO || "https://via.placeholder.com/150x50/3B82F6/FFFFFF?text=AIR+Demo",
    redirectUrlForIssuer: import.meta.env.VITE_REDIRECT_URL_FOR_ISSUER || "",
  });

  const handleConfigChange = (field: string, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const generateWidget = async () => {
    try {
      // Create the query request
      const queryRequest: QueryRequest = {
        process: "Verify",
        verifierAuth: config.verifierAuth,
        programId: config.programId,
      };

      // Create and configure the widget with proper options
      widgetRef.current = new AirCredentialWidget(queryRequest, config.projectName, config.projectLogo, {
        endpoint: WIDGET_ENV,
        theme: THEME as "light" | "dark" | "auto",
        locale: LOCALE as string,
        redirectUrlForIssuer: config.redirectUrlForIssuer || undefined,
      });

      // Set up event listeners
      widgetRef.current.on("verifyCompleted", (results: VerificationResults) => {
        setVerificationResult(results);
        setIsLoading(false);
        console.log("Verification completed:", results);
      });

      widgetRef.current.on("close", () => {
        setIsLoading(false);
        console.log("Widget closed");
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create widget");
      setIsLoading(false);
    }
  };

  const handleVerifyCredential = async () => {
    setIsLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      // Generate widget if not already created
      if (!widgetRef.current) {
        await generateWidget();
      }

      // Start the widget
      if (widgetRef.current) {
        widgetRef.current.launch();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setVerificationResult(null);
    setError(null);
    if (widgetRef.current) {
      widgetRef.current.destroy();
      widgetRef.current = null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Compliant":
        return "text-green-800 bg-green-50 border-green-200";
      case "Non-Compliant":
        return "text-red-800 bg-red-50 border-red-200";
      case "Pending":
        return "text-yellow-800 bg-yellow-50 border-yellow-200";
      case "Revoking":
      case "Revoked":
        return "text-orange-800 bg-orange-50 border-orange-200";
      case "Expired":
        return "text-gray-800 bg-gray-50 border-gray-200";
      case "NotFound":
        return "text-purple-800 bg-purple-50 border-purple-200";
      default:
        return "text-gray-800 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Compliant":
        return "✅";
      case "Non-Compliant":
        return "❌";
      case "Pending":
        return "⏳";
      case "Revoking":
        return "🔄";
      case "Revoked":
        return "🚫";
      case "Expired":
        return "⏰";
      case "NotFound":
        return "🔍";
      default:
        return "❓";
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "Compliant":
        return "The credential is valid and meets all verification requirements.";
      case "Non-Compliant":
        return "The credential does not meet the verification requirements.";
      case "Pending":
        return "The credential is waiting for confirmation on the blockchain.";
      case "Revoking":
        return "The credential is currently being revoked.";
      case "Revoked":
        return "The credential has been revoked and is no longer valid.";
      case "Expired":
        return "The credential has expired and is no longer valid.";
      case "NotFound":
        return "No credential was found matching the verification criteria.";
      default:
        return "Unknown verification status.";
    }
  };

  useEffect(() => {
    return () => {
      if (widgetRef.current) {
        widgetRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Credential Verification</h2>
          <p className="text-gray-600">
            Verify digital credentials using the AIR Credential SDK. Configure the verification parameters below and Start the widget to begin the
            verification process.
          </p>
        </div>

        {/* Configuration Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verifier Auth Token</label>
              <input
                type="password"
                value={config.verifierAuth}
                onChange={(e) => handleConfigChange("verifierAuth", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Your verifier auth token"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Program ID</label>
              <input
                type="text"
                value={config.programId}
                onChange={(e) => handleConfigChange("programId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="program-123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
              <input
                type="text"
                value={config.projectName}
                onChange={(e) => handleConfigChange("projectName", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Your Project Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Logo URL</label>
              <input
                type="url"
                value={config.projectLogo}
                onChange={(e) => handleConfigChange("projectLogo", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Redirect URL for Issuer</label>
              <input
                type="url"
                value={config.redirectUrlForIssuer}
                onChange={(e) => handleConfigChange("redirectUrlForIssuer", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com/issue-credential"
              />
            </div>
          </div>
        </div>

        {/* Environment Info */}
        <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Environment Configuration:</h4>
          <div className="text-xs text-gray-700 space-y-1">
            <p>
              <strong>Widget Environment:</strong> {WIDGET_ENV}
            </p>
            <p>
              <strong>Theme:</strong> {THEME}
            </p>
            <p>
              <strong>Locale:</strong> {LOCALE}
            </p>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Verification Results */}
        {verificationResult && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Verification Results</h3>
            <div className="p-4 border rounded-md">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Verification Result</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(verificationResult.status)}`}>
                  {getStatusIcon(verificationResult.status)} {verificationResult.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{getStatusDescription(verificationResult.status)}</p>
              <pre className="text-xs text-gray-500 bg-gray-50 p-2 rounded overflow-auto">{JSON.stringify(verificationResult, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleVerifyCredential}
            disabled={isLoading}
            className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Launching...
              </span>
            ) : (
              "Start Credential Verification"
            )}
          </button>

          {verificationResult && (
            <button
              onClick={handleReset}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Instructions:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Configure the verifier auth token and program ID</li>
            <li>• Customize the project name and logo if needed</li>
            <li>• Set the redirect URL for issuer if required</li>
            <li>• Click "Start Credential Verification" to start the process</li>
            <li>• The widget will handle the credential verification flow</li>
            <li>• Review the verification results after completion</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CredentialVerification;
