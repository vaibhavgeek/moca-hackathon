import { useState, useEffect, useRef } from "react";
import { AirCredentialWidget, type ClaimRequest, type JsonDocumentObject } from "@mocanetwork/air-credential-sdk";
import "@mocanetwork/air-credential-sdk/dist/style.css";

// Environment variables for configuration
const WIDGET_ENV = import.meta.env.VITE_WIDGET_ENV || "https://widget.air.xyz";
const THEME = import.meta.env.VITE_THEME || "light";
const LOCALE = import.meta.env.VITE_LOCALE || "en";

interface CredentialField {
  id: string;
  name: string;
  type: "string" | "number" | "boolean" | "date";
  value: string | number | boolean;
}

const CredentialIssuance = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const widgetRef = useRef<AirCredentialWidget | null>(null);

  // Configuration - these would typically come from environment variables or API
  const [config, setConfig] = useState({
    issuerDid: import.meta.env.VITE_ISSUER_DID || "did:example:issuer123",
    issuerAuth: import.meta.env.VITE_ISSUER_AUTH_TOKEN || "your-issuer-auth-token",
    credentialId: import.meta.env.VITE_CREDENTIAL_ID || "credential-type-123",
    projectName: import.meta.env.VITE_PROJECT_NAME || "AirCredentialSdkDemo",
    projectLogo: import.meta.env.VITE_PROJECT_LOGO || "https://via.placeholder.com/150x50/3B82F6/FFFFFF?text=AIR+Demo",
    redirectUrlForIssuer: import.meta.env.VITE_REDIRECT_URL_FOR_ISSUER || "",
  });

  // Dynamic credential subject fields
  const [credentialFields, setCredentialFields] = useState<CredentialField[]>([
    {
      id: "1",
      name: "name",
      type: "string",
      value: "",
    },
  ]);

  const handleConfigChange = (field: string, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const addCredentialField = () => {
    const newField: CredentialField = {
      id: Date.now().toString(),
      name: "",
      type: "string",
      value: "",
    };
    setCredentialFields([...credentialFields, newField]);
  };

  const updateCredentialField = (id: string, field: Partial<CredentialField>) => {
    setCredentialFields(credentialFields.map((f) => (f.id === id ? { ...f, ...field } : f)));
  };

  const removeCredentialField = (id: string) => {
    setCredentialFields(credentialFields.filter((f) => f.id !== id));
  };

  const convertFieldsToCredentialSubject = (): JsonDocumentObject => {
    const subject: JsonDocumentObject = {};
    credentialFields.forEach((field) => {
      if (field.name.trim()) {
        let value: string | number | boolean = field.value;

        // Convert value based on type
        switch (field.type) {
          case "number":
            value = typeof field.value === "string" ? parseFloat(field.value) || 0 : field.value;
            break;
          case "boolean":
            value = typeof field.value === "string" ? field.value === "true" : field.value;
            break;
          case "date":
            if (typeof field.value === "string") {
              // Convert date string to YYYYMMDD format
              const date = new Date(field.value);
              if (!isNaN(date.getTime())) {
                value = parseInt(
                  date.getFullYear().toString() + (date.getMonth() + 1).toString().padStart(2, "0") + date.getDate().toString().padStart(2, "0")
                );
              }
            }
            break;
          default:
            value = field.value;
        }

        subject[field.name] = value;
      }
    });
    return subject;
  };

  const generateWidget = async () => {
    try {
      const credentialSubject = convertFieldsToCredentialSubject();

      // Create the claim request
      const claimRequest: ClaimRequest = {
        process: "Issue",
        issuerDid: config.issuerDid,
        issuerAuth: config.issuerAuth,
        credentialId: config.credentialId,
        credentialSubject: credentialSubject,
      };

      // Create and configure the widget with proper options
      widgetRef.current = new AirCredentialWidget(claimRequest, config.projectName, config.projectLogo, {
        endpoint: WIDGET_ENV,
        theme: THEME as "light" | "dark" | "auto",
        locale: LOCALE as string,
        redirectUrlForIssuer: config.redirectUrlForIssuer || undefined,
      });

      // Set up event listeners
      widgetRef.current.on("issueCompleted", () => {
        setIsSuccess(true);
        setIsLoading(false);
        console.log("Credential issuance completed successfully!");
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

  const handleIssueCredential = async () => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

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

  const renderFieldValueInput = (field: CredentialField) => {
    switch (field.type) {
      case "boolean":
        return (
          <select
            value={field.value.toString()}
            onChange={(e) => updateCredentialField(field.id, { value: e.target.value === "true" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        );
      case "date":
        return (
          <input
            type="date"
            value={typeof field.value === "string" ? field.value : ""}
            onChange={(e) => updateCredentialField(field.id, { value: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        );
      case "number":
        return (
          <input
            type="number"
            value={field.value.toString()}
            onChange={(e) => updateCredentialField(field.id, { value: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        );
      default:
        return (
          <input
            type="text"
            value={field.value.toString()}
            onChange={(e) => updateCredentialField(field.id, { value: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter value"
          />
        );
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Credential Issuance</h2>
          <p className="text-gray-600">
            Issue digital credentials to users using the AIR Credential SDK. Configure the issuance parameters below and Start the widget to begin the
            process.
          </p>
        </div>

        {/* Configuration Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issuer DID</label>
              <input
                type="text"
                value={config.issuerDid}
                onChange={(e) => handleConfigChange("issuerDid", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="did:example:issuer123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issuer Auth Token</label>
              <input
                type="password"
                value={config.issuerAuth}
                onChange={(e) => handleConfigChange("issuerAuth", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Your issuer auth token"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Credential ID</label>
              <input
                type="text"
                value={config.credentialId}
                onChange={(e) => handleConfigChange("credentialId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="credential-type-123"
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

        {/* Dynamic Credential Subject Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Credential Subject</h3>
            <button
              onClick={addCredentialField}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Field
            </button>
          </div>

          {credentialFields.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No credential fields added yet.</p>
              <p className="text-sm">Click "Add Field" to start building your credential subject.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {credentialFields.map((field) => (
                <div key={field.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Field Name</label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateCredentialField(field.id, { name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., name, email, age"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select
                        value={field.type}
                        onChange={(e) => updateCredentialField(field.id, { type: e.target.value as "string" | "number" | "boolean" | "date" })}
                        className="w-full h-[42px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 "
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="date">Date</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                      {renderFieldValueInput(field)}
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => removeCredentialField(field.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        title="Remove field"
                      >
                        <svg
                          className="w-5 h-5 transform group-hover:scale-110 transition-transform duration-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

        {isSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">✅ Credential issuance completed successfully!</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleIssueCredential}
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
              "Start Credential Issuance"
            )}
          </button>

          {isSuccess && (
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
            <li>• Configure the issuer DID, auth token, and credential ID</li>
            <li>• Add credential subject fields using the "Add Field" button</li>
            <li>• Set field name, type (string, number, boolean, date), and value</li>
            <li>• Customize the project name and logo if needed</li>
            <li>• Click "Start Credential Issuance" to start the process</li>
            <li>• The widget will handle the credential issuance flow</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CredentialIssuance;
