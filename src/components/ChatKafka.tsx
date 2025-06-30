import React, { useState, useEffect, useRef } from "react";
import { AirCredentialWidget, type QueryRequest, type VerificationResults, type Language } from "@mocanetwork/air-credential-sdk";
import "@mocanetwork/air-credential-sdk/dist/style.css";
import { type AirService, BUILD_ENV } from "@mocanetwork/airkit";
import type { BUILD_ENV_TYPE } from "@mocanetwork/airkit";
import type { EnvironmentConfig } from "../config/environments";
import { ChatService } from "../services/chatService";

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

const ChatKafka: React.FC<ChatProps> = ({ isLoggedIn, airService, airKitBuildEnv, partnerId, environmentConfig }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verifiedRole, setVerifiedRole] = useState<'student' | 'teacher' | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ 
    role: string; 
    message: string; 
    timestamp?: number; 
    userId?: string; 
    userRole?: string;
    title?: string;
    name?: string;
    serverList?: string[];
    type?: string;
    filtered?: boolean;
    filter_reason?: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const widgetRef = useRef<AirCredentialWidget | null>(null);
  const chatServiceRef = useRef<ChatService | null>(null);
  const processedMessageIds = useRef<Set<string>>(new Set());
  const userIdRef = useRef<string>("");

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
          
          // Initialize chat service
          const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          userIdRef.current = userId;
          chatServiceRef.current = new ChatService(userId, role);
          
          setChatHistory([{
            role: "system",
            message: `Welcome! You have been verified as a ${role}. You can now start chatting in the mcp_agent_queen channel. ${
              role === 'student' 
                ? 'Note: As a student, you cannot access certain restricted content including cheating materials, exam answers, or adult content.' 
                : 'As a teacher, you have full access to all features.'
            }`,
            timestamp: Date.now()
          }]);
          
          // Start polling for messages
          startMessagePolling();
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

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !chatServiceRef.current) return;

    const message = chatMessage.trim();
    setChatMessage("");
    setIsLoading(true);

    // Check if message should be filtered for students
    if (chatServiceRef.current.shouldFilterMessage(message)) {
      setChatHistory(prev => [...prev, { 
        role: "system", 
        message: "This type of content is not allowed for student accounts.",
        timestamp: Date.now()
      }]);
      setIsLoading(false);
      return;
    }

    // For students, don't add message to chat history immediately
    // Wait for the server response to see if it gets filtered
    if (verifiedRole !== 'student') {
      // Add message to local chat history only for teachers
      setChatHistory(prev => [...prev, { 
        role: "user", 
        message: message,
        timestamp: Date.now(),
        userId: userIdRef.current,
        userRole: verifiedRole || undefined
      }]);
    }

    try {
      // Send message to Kafka
      const result = await chatServiceRef.current.sendMessage(message);
      
      if (!result.success) {
        setChatHistory(prev => [...prev, { 
          role: "system", 
          message: "Failed to send message. Please try again.",
          timestamp: Date.now()
        }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setChatHistory(prev => [...prev, { 
        role: "system", 
        message: "Error sending message. Please check your connection.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startMessagePolling = () => {
    // Clear processed messages when starting polling
    processedMessageIds.current.clear();
    
    // Poll for new messages every 2 seconds
    const interval = setInterval(async () => {
      if (!chatServiceRef.current) return;
      
      try {
        const messages = await chatServiceRef.current.fetchMessages(10);
        
        // Process all messages and update chat history
        const messagesToAdd: any[] = [];
        
        messages.forEach((msg: any) => {
          // Use the messageId from the service or generate a stable one
          const messageId = msg.messageId || `${msg.type}_${msg.timestamp}_${msg.userId || 'system'}`;
          
          // Skip if we've already processed this message
          if (processedMessageIds.current.has(messageId)) return;
          
          // Process student_message type messages as well
          // Remove the skip logic to ensure all messages are shown
          
          processedMessageIds.current.add(messageId);
          messagesToAdd.push(msg);
        });
        
        // Add new messages to chat history
        if (messagesToAdd.length > 0) {
          setChatHistory(prev => {
            const newMessages = messagesToAdd.map(msg => ({
              role: msg.type === 'assistant' || msg.type === 'assistant_message' ? 'assistant' : (msg.userId === userIdRef.current ? 'user' : 'other'),
              message: msg.content || msg.message,
              timestamp: msg.timestamp,
              userId: msg.userId,
              userRole: msg.userRole,
              title: msg.title,
              name: msg.name,
              serverList: msg.serverList,
              type: msg.type,
              filtered: msg.filtered,
              filter_reason: msg.filter_reason
            }));
            
            // Combine with existing messages and remove duplicates
            const combined = [...prev, ...newMessages];
            const uniqueMessages = combined.filter((msg, index) => {
              // Check if this message already exists in previous messages
              const isDuplicate = combined.findIndex((m, i) => 
                i < index && 
                m.timestamp === msg.timestamp && 
                m.message === msg.message &&
                m.userId === msg.userId &&
                m.role === msg.role
              ) !== -1;
              
              return !isDuplicate;
            });
            
            return uniqueMessages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
          });
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    }, 2000);
    
    setPollingInterval(interval);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (widgetRef.current) {
        widgetRef.current.destroy();
      }
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const chatContainer = document.getElementById('chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="flex-1 p-2 sm:p-4 lg:p-8 bg-gray-50 relative">
      {/* Translucent Chat Backdrop when not verified */}
      {!isVerified && isLoggedIn && (
        <div className="absolute inset-0 p-2 sm:p-4 lg:p-8 pointer-events-none">
          <div className="w-full sm:max-w-2xl md:max-w-4xl lg:max-w-6xl sm:mx-auto h-full">
            <div className="bg-white/30 backdrop-blur-sm rounded-xl h-full p-4 sm:p-6 lg:p-8 border border-gray-200/30">
              <div className="h-full flex flex-col">
                <div className="mb-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-400">AI Assistant Chat</h2>
                  <p className="text-gray-400 text-sm mt-2">Verify your identity to unlock chat</p>
                </div>
                <div className="flex-1 bg-gray-100/20 rounded-lg" />
                <div className="mt-4 flex space-x-2">
                  <div className="flex-1 h-12 bg-gray-200/20 rounded-lg" />
                  <div className="w-20 h-12 bg-gray-300/20 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full sm:max-w-2xl md:max-w-4xl lg:max-w-6xl sm:mx-auto bg-white rounded-xl shadow-elegant-lg p-2 sm:p-6 lg:p-8 border border-gray-100 relative z-10">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#15110E] mb-2 sm:mb-4">AI Assistant Chat</h2>
          {!isVerified && (
            <p className="text-gray-600 text-sm sm:text-base">
              Please verify your identity to access the AI assistant.
            </p>
          )}
          {isVerified && (
            <p className="text-gray-600 text-sm sm:text-base">
              Verified as: <span className="font-semibold text-[#F7AD33]">{verifiedRole === 'student' ? '🎓 Student' : '👨‍🏫 Teacher'}</span>
              <span className="ml-2 text-xs text-gray-500">Channel: mcp_agent_queen</span>
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
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-[#15110E] mb-2">Verify Your Identity</h3>
                <p className="text-[#15110E]/70 text-sm">Choose your role to access the AI assistant</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleVerification('student')}
                  disabled={verificationInProgress}
                  className="group relative overflow-hidden bg-[#F7AD33] text-white px-6 py-4 rounded-lg font-medium hover:bg-[#e09c2e] focus:outline-none focus:ring-2 focus:ring-[#F7AD33] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-2xl">🎓</span>
                    <span>{verificationInProgress ? "Verifying..." : "Chat as Student"}</span>
                  </div>
                </button>
                <button
                  onClick={() => handleVerification('teacher')}
                  disabled={verificationInProgress}
                  className="group relative overflow-hidden bg-[#15110E] text-white px-6 py-4 rounded-lg font-medium hover:bg-[#2a241f] focus:outline-none focus:ring-2 focus:ring-[#15110E] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-2xl">👨‍🏫</span>
                    <span>{verificationInProgress ? "Verifying..." : "Chat as Teacher"}</span>
                  </div>
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
            <div id="chat-messages" className="border border-gray-200 rounded-xl p-4 h-96 overflow-y-auto bg-gradient-to-b from-gray-50 to-white shadow-inner">
              {chatHistory.length === 0 ? (
                <p className="text-gray-500 text-center">No messages yet. Start a conversation!</p>
              ) : (
                <div className="space-y-3">
                  {chatHistory.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === 'user' && msg.userId === userIdRef.current ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-lg shadow-sm ${
                          msg.role === 'user' && msg.userId === userIdRef.current
                            ? 'bg-[#F7AD33] text-white'
                            : msg.role === 'system'
                            ? 'bg-[#15110E] text-white'
                            : msg.role === 'assistant'
                            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 text-gray-800'
                            : 'bg-white border border-gray-200 text-gray-800'
                        }`}
                      >
                        {msg.role === 'assistant' && msg.title && (
                          <div className="flex items-center mb-2 pb-2 border-b border-green-300">
                            <span className="text-xs font-semibold text-green-700">🤖 {msg.title}</span>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        {msg.filtered && msg.filter_reason && (
                          <div className="mt-2 pt-2 border-t border-red-300">
                            <p className="text-xs text-red-600 italic">⚠️ {msg.filter_reason}</p>
                          </div>
                        )}
                        {msg.role === 'assistant' && msg.serverList && msg.serverList.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-green-300">
                            <p className="text-xs text-green-700">Available tools: {msg.serverList.join(', ')}</p>
                          </div>
                        )}
                        {msg.userRole && msg.role !== 'system' && msg.role !== 'assistant' && (
                          <p className="text-xs mt-1 opacity-70">
                            {msg.userRole === 'student' ? '🎓' : '👨‍🏫'} {msg.userRole}
                            {msg.userId !== userIdRef.current && (
                              <span className="ml-1 text-xs">• {msg.userId?.slice(0, 8)}</span>
                            )}
                          </p>
                        )}
                        {msg.timestamp && (
                          <p className="text-xs mt-1 opacity-50">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        )}
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
                placeholder={verifiedRole === 'student' ? "Type your message (restricted content filtered)..." : "Type your message..."}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F7AD33] focus:border-[#F7AD33] transition-all duration-200 hover:border-gray-400"
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatMessage.trim() || isLoading}
                className="bg-[#F7AD33] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#e09c2e] focus:outline-none focus:ring-2 focus:ring-[#F7AD33] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
            
            {verifiedRole === 'student' && (
              <p className="text-xs text-gray-500 mt-2">
                Note: Certain content is restricted for student accounts including cheating materials and adult content.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatKafka;