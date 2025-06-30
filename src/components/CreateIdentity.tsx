import { useState, useEffect, useRef } from "react";
import { AirCredentialWidget, type ClaimRequest, type JsonDocumentObject, type Language } from "@mocanetwork/air-credential-sdk";
import "@mocanetwork/air-credential-sdk/dist/style.css";
import { AirService, BUILD_ENV } from "@mocanetwork/airkit";
import type { BUILD_ENV_TYPE } from "@mocanetwork/airkit";
import type { EnvironmentConfig } from "../config/environments";

// Fixed configuration values
const FIXED_ISSUER_DID = "did:air:id:test:4P69Zb8oDeLVpSW3SHQZSQnb2R5LKFpKuDCC8zmT2T";
const FIXED_API_KEY = "Gc8XhwIVXZOxUVOoxC7zIrOUV4qE15nEpWpAKbqU";
const FIXED_CREDENTIAL_ID = "c21hi0g09uibs00b4797FL";
const LOCALE = import.meta.env.VITE_LOCALE || "en";

interface CreateIdentityProps {
  airService: AirService | null;
  isLoggedIn: boolean;
  airKitBuildEnv: BUILD_ENV_TYPE;
  partnerId: string;
  environmentConfig: EnvironmentConfig;
}

const getIssuerAuthToken = async (issuerDid: string, apiKey: string, apiUrl: string): Promise<string | null> => {
  try {
    const response = await fetch(`${apiUrl}/issuer/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        "X-Test": "true",
      },
      body: JSON.stringify({
        issuerDid: issuerDid,
        authToken: apiKey,
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.code === 80000000 && data.data && data.data.token) {
      return data.data.token;
    } else {
      console.error("Failed to get issuer auth token from API:", data.msg || "Unknown error");
      return null;
    }
  } catch (error) {
    console.error("Error fetching issuer auth token:", error);
    return null;
  }
};

const CreateIdentity = ({ airService, isLoggedIn, airKitBuildEnv, partnerId, environmentConfig }: CreateIdentityProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string>("student");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [studentTeacherId, setStudentTeacherId] = useState<string>("");
  const widgetRef = useRef<AirCredentialWidget | null>(null);

  const generateWidget = async () => {
    try {
      // Step 1: Fetch the issuer auth token using the API key
      const fetchedIssuerAuthToken = await getIssuerAuthToken(FIXED_ISSUER_DID, FIXED_API_KEY, environmentConfig.apiUrl);

      if (!fetchedIssuerAuthToken) {
        setError("Failed to fetch issuer authentication token. Please check your DID and API Key.");
        setIsLoading(false);
        return;
      }

      const credentialSubject: JsonDocumentObject = {
        role: role,
        user_id: studentTeacherId
      };

      console.log("credentialSubject", credentialSubject);

      // Create the claim request with the fetched token
      const claimRequest: ClaimRequest = {
        process: "Issue",
        issuerDid: FIXED_ISSUER_DID,
        issuerAuth: fetchedIssuerAuthToken,
        credentialId: FIXED_CREDENTIAL_ID,
        credentialSubject: credentialSubject,
      };

      const rp = await airService?.goToPartner(environmentConfig.widgetUrl).catch((err) => {
        console.error("Error getting URL with token:", err);
      });

      console.log("urlWithToken", rp, rp?.urlWithToken);

      if (!rp?.urlWithToken) {
        console.warn("Failed to get URL with token. Please check your partner ID.");
        setError("Failed to get URL with token. Please check your partner ID.");
        setIsLoading(false);
        return;
      }

      // Create and configure the widget with proper options
      widgetRef.current = new AirCredentialWidget(claimRequest, partnerId, {
        endpoint: rp?.urlWithToken,
        airKitBuildEnv: airKitBuildEnv || BUILD_ENV.STAGING,
        theme: "light",
        locale: LOCALE as Language,
      });

      // Set up event listeners
      widgetRef.current.on("issueCompleted", () => {
        setIsSuccess(true);
        setIsLoading(false);
        console.log("Identity created successfully!");
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

  const handleCreateIdentity = async () => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      await generateWidget();

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
    setIsSuccess(false);
    setError(null);
    if (widgetRef.current) {
      widgetRef.current.destroy();
      widgetRef.current = null;
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
    <div className="flex-1 p-2 sm:p-4 lg:p-8 bg-gray-50">
      <div className="w-full sm:max-w-2xl md:max-w-4xl lg:max-w-6xl sm:mx-auto bg-white rounded-xl shadow-elegant-lg p-4 sm:p-6 lg:p-8 border border-gray-100">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#15110E] mb-2 sm:mb-4">Create Your Identity</h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Create your digital identity on MocaVerse University. Fill in your details and submit to get started.
          </p>
        </div>

        {/* Form Section */}
        <div className="space-y-6 mb-8">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-[#15110E] mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F7AD33] focus:border-[#F7AD33] transition-all duration-200 hover:border-gray-400"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-[#15110E] mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F7AD33] focus:border-[#F7AD33] transition-all duration-200 hover:border-gray-400"
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-[#15110E] mb-2">Select Your Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F7AD33] focus:border-[#F7AD33] transition-all duration-200 hover:border-gray-400 bg-white"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          {/* ID Field */}
          <div>
            <label className="block text-sm font-medium text-[#15110E] mb-2">
              {role === 'student' ? 'Student ID' : 'Teacher ID'}
            </label>
            <input
              type="text"
              value={studentTeacherId}
              onChange={(e) => setStudentTeacherId(e.target.value)}
              placeholder={`Enter your ${role} ID`}
              className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F7AD33] focus:border-[#F7AD33] transition-all duration-200 hover:border-gray-400"
            />
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 sm:mb-6 p-2 sm:p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-xs sm:text-base">{error}</p>
          </div>
        )}

        {isSuccess && (
          <div className="mb-4 sm:mb-6 p-2 sm:p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-xs sm:text-base">✅ Identity created successfully!</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleCreateIdentity}
            disabled={isLoading || !isLoggedIn || !name || !email || !studentTeacherId}
            className="w-full sm:flex-1 max-w-md bg-[#F7AD33] text-white px-4 sm:px-6 py-3 rounded-lg font-medium hover:bg-[#e09c2e] focus:outline-none focus:ring-2 focus:ring-[#F7AD33] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
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
                Creating Identity...
              </span>
            ) : (
              "Create Identity"
            )}
          </button>

          {isSuccess && (
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-4 sm:px-6 py-3 border border-[#15110E] text-[#15110E] rounded-lg font-medium hover:bg-[#15110E] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#15110E] focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Reset
            </button>
          )}
        </div>

        {!isLoggedIn && (
          <div className="mt-4 p-2 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800 text-xs sm:text-base">Please connect your wallet to create an identity.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateIdentity;