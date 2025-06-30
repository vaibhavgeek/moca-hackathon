import React, { useState, useEffect, useRef } from "react";
import { AirCredentialWidget, type QueryRequest, type VerificationResults, type Language } from "@mocanetwork/air-credential-sdk";
import "@mocanetwork/air-credential-sdk/dist/style.css";
import { type AirService, BUILD_ENV } from "@mocanetwork/airkit";
import type { BUILD_ENV_TYPE } from "@mocanetwork/airkit";
import type { EnvironmentConfig } from "../config/environments";

interface ChatProps {
  isLoggedIn: boolean;
  airService: AirService | null;
  airKitBuildEnv: BUILD_ENV_TYPE;
  partnerId: string;
  environmentConfig: EnvironmentConfig;
}

const LOCALE = import.meta.env.VITE_LOCALE || "en";

// Verification configuration
const VERIFIER_DID = "did:key:Xwp7xXXyWPXdHXmh4MoikBEeTjtYwZwH3XjejvXkMvdae3X5QHijS6CszYJUyqVv4Qjt6aLDG4AYpA4GvXWg3Ng23RX";
const VERIFIER_API_KEY = "4xaxzajL03boJlPYe211tmJxCahGW6fAOW9Ocjr7";
const STUDENT_PROGRAM_ID = "c21hi031apbsm0018188wq";
const TEACHER_PROGRAM_ID = "c21hi031apxk70028188BW";

const getVerifierAuthToken = async (verifierDid: string, apiKey: string, apiUrl: string): Promise<string | null> => {
  try {
    const response = await fetch(`${apiUrl}/verifier/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        "X-Test": "true",
      },
      body: JSON.stringify({
        verifierDid: verifierDid,
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
      console.error("Failed to get verifier auth token from API:", data.msg || "Unknown error");
      return null;
    }
  } catch (error) {
    console.error("Error fetching verifier auth token:", error);
    return null;
  }
};

const Chat: React.FC<ChatProps> = ({ isLoggedIn, airService, airKitBuildEnv, partnerId, environmentConfig }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verifiedRole, setVerifiedRole] = useState<'student' | 'teacher' | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; message: string }>>([]);
  const widgetRef = useRef<AirCredentialWidget | null>(null);

  const handleVerification = async (role: 'student' | 'teacher') => {
    if (!isLoggedIn) {
      setVerificationError("Please connect your wallet first.");
      return;
    }

    setVerificationInProgress(true);
    setVerificationError(null);

    try {
      // Get the appropriate program ID based on role
      const programId = role === 'student' ? STUDENT_PROGRAM_ID : TEACHER_PROGRAM_ID;

      // Fetch the verifier auth token
      const verifierAuthToken = await getVerifierAuthToken(VERIFIER_DID, VERIFIER_API_KEY, environmentConfig.apiUrl);

      if (!verifierAuthToken) {
        throw new Error("Failed to fetch verifier authentication token.");
      }

      // Create the query request
      const queryRequest: QueryRequest = {
        process: "Verify",
        verifierAuth: verifierAuthToken,
        programId: programId,
      };

      const rp = await airService?.goToPartner(environmentConfig.widgetUrl).catch((err) => {
        console.error("Error getting URL with token:", err);
        throw new Error("Failed to get partner URL.");
      });

      if (!rp?.urlWithToken) {
        throw new Error("Failed to get URL with token.");
      }

      // Create and configure the widget
      widgetRef.current = new AirCredentialWidget(queryRequest, partnerId, {
        endpoint: rp?.urlWithToken,
        airKitBuildEnv: airKitBuildEnv || BUILD_ENV.STAGING,
        theme: "light",
        locale: LOCALE as Language,
      });

      // Set up event listeners
      widgetRef.current.on("verifyCompleted", (results: VerificationResults) => {
        if (results.status === "Compliant") {
          setIsVerified(true);
          setVerifiedRole(role);
          setChatHistory([{
            role: "system",
            message: `Welcome! You have been verified as a ${role}. You can now start chatting.`
          }]);
        } else {
          setVerificationError(`Verification failed: ${results.status}`);
        }
        setVerificationInProgress(false);
      });

      widgetRef.current.on("close", () => {
        setVerificationInProgress(false);
        if (!isVerified) {
          setVerificationError("Verification cancelled.");
        }
      });

      // Launch the widget
      widgetRef.current.launch();
    } catch (error) {
      setVerificationError(error instanceof Error ? error.message : "Verification failed.");
      setVerificationInProgress(false);
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    // Add message to chat history
    setChatHistory(prev => [...prev, { role: "user", message: chatMessage }]);
    
    // Simulate LLM response (in a real app, this would call your backend)
    setTimeout(() => {
      const response = verifiedRole === 'student' 
        ? `As a student assistant, I can help you with: course materials, assignments, study tips, and academic questions. How can I assist you today?`
        : `As a teacher assistant, I can help you with: lesson planning, student management, grading strategies, and educational resources. What do you need help with?`;
      
      setChatHistory(prev => [...prev, { role: "assistant", message: response }]);
    }, 1000);

    setChatMessage("");
  };

  // Cleanup widget on unmount
  useEffect(() => {
    return () => {
      if (widgetRef.current) {
        widgetRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="flex-1 p-2 sm:p-4 lg:p-8 bg-gray-50">
      <div className="w-full sm:max-w-2xl md:max-w-4xl lg:max-w-6xl sm:mx-auto bg-white rounded-xl shadow-elegant-lg p-2 sm:p-6 lg:p-8 border border-gray-100">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#15110E] mb-2 sm:mb-4">AI Assistant Chat</h2>
          {!isVerified && (
            <p className="text-gray-600 text-sm sm:text-base">
              Please verify your identity to access the AI assistant.
            </p>
          )}
          {isVerified && (
            <p className="text-gray-600 text-sm sm:text-base">
              Verified as: <span className="font-semibold text-[#F7AD33]">{verifiedRole === 'student' ? 'Student' : 'Teacher'}</span>
            </p>
          )}
        </div>

        {!isLoggedIn && (
          <div className="mt-4 p-2 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 text-xs sm:text-base font-medium">Please connect your wallet to access the chat.</p>
          </div>
        )}

        {isLoggedIn && !isVerified && (
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl shadow-md">
              <p className="text-[#15110E] text-base font-medium mb-6">Choose your role to verify your identity:</p>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleVerification('student')}
                  disabled={verificationInProgress}
                  className="flex-1 bg-[#F7AD33] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#e09c2e] focus:outline-none focus:ring-2 focus:ring-[#F7AD33] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  {verificationInProgress ? "Verifying..." : "Verify as Student"}
                </button>
                <button
                  onClick={() => handleVerification('teacher')}
                  disabled={verificationInProgress}
                  className="flex-1 bg-[#15110E] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#2a241f] focus:outline-none focus:ring-2 focus:ring-[#15110E] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  {verificationInProgress ? "Verifying..." : "Verify as Teacher"}
                </button>
              </div>
            </div>

            {verificationError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                <p className="text-red-800 text-sm">{verificationError}</p>
              </div>
            )}
          </div>
        )}

        {isVerified && (
          <div className="space-y-4">
            {/* Chat History */}
            <div className="border border-gray-200 rounded-xl p-4 h-96 overflow-y-auto bg-gradient-to-b from-gray-50 to-white shadow-inner">
              {chatHistory.length === 0 ? (
                <p className="text-gray-500 text-center">No messages yet. Start a conversation!</p>
              ) : (
                <div className="space-y-3">
                  {chatHistory.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-[#F7AD33] text-white shadow-md'
                            : msg.role === 'system'
                            ? 'bg-[#15110E] text-white shadow-md'
                            : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F7AD33] focus:border-[#F7AD33] transition-all duration-200 hover:border-gray-400"
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatMessage.trim()}
                className="bg-[#F7AD33] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#e09c2e] focus:outline-none focus:ring-2 focus:ring-[#F7AD33] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;