import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Bot, ArrowRight, Lock, Zap, Building } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            Welcome to <span className="text-blue-500">CommandHive</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
            Just as role-based API access transformed enterprise operations, we're pioneering the next frontier: 
            <span className="text-blue-400 font-semibold"> Role-Based AI Agents</span>
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/create-identity">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2">
                Get Started <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link to="/chat">
              <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105">
                Try Chat Demo
              </button>
            </Link>
          </div>
        </div>

        {/* Main Value Proposition */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 mb-16 border border-gray-700">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                The Evolution of Access Control
              </h2>
              <div className="space-y-4 text-gray-300">
                <p className="text-lg">
                  <span className="text-blue-400 font-semibold">Role-based API access</span> revolutionized how enterprises 
                  manage data and services, enabling secure, scalable operations.
                </p>
                <p className="text-lg">
                  Now, as AI agents become integral to business processes, we see a critical gap: 
                  <span className="text-yellow-400 font-semibold"> AI agents lack sophisticated role-based access controls</span>.
                </p>
                <p className="text-lg font-semibold text-white">
                  CommandHive is building the infrastructure for the next generation of secure, role-aware AI systems.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20"></div>
                <Shield className="w-48 h-48 text-blue-500 relative z-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all">
            <Lock className="w-12 h-12 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Role-Based Access</h3>
            <p className="text-gray-400">
              Define granular permissions for AI agents based on organizational roles, ensuring secure and appropriate responses.
            </p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all">
            <Zap className="w-12 h-12 text-yellow-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Low-Hanging Fruit</h3>
            <p className="text-gray-400">
              While others chase complexity, we're solving a fundamental need that every enterprise will face as they adopt AI.
            </p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all">
            <Building className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Enterprise Ready</h3>
            <p className="text-gray-400">
              Built for scale with enterprise-grade security, compliance, and integration capabilities from day one.
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-8 md:p-12 mb-16 border border-gray-700">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            How CommandHive Works
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 rounded-full p-2 flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Create Identity</h3>
                  <p className="text-gray-300">
                    Set up user identities with specific roles and permissions. Define what data and capabilities each role can access.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-purple-600 rounded-full p-2 flex-shrink-0">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Role-Aware Chat</h3>
                  <p className="text-gray-300">
                    AI agents automatically adapt their responses based on the user's role, providing appropriate information and actions.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
              <h4 className="text-lg font-bold text-white mb-4">Example Use Cases:</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span><strong>HR Manager:</strong> Access to employee data and HR policies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span><strong>Developer:</strong> Technical documentation and code repositories</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span><strong>Executive:</strong> High-level metrics and strategic insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span><strong>Customer Support:</strong> Customer data and support tools</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Experience the Future?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Start building secure, role-aware AI agents today. No one else is focusing on this critical infrastructure - be an early adopter.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/create-identity">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-lg transition-all transform hover:scale-105 text-lg flex items-center gap-2">
                Create Your First Identity <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;