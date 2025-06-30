import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Bot, ArrowRight, Lock, Zap, Building, ChevronRight, Play, Database, Network, Cloud } from 'lucide-react';
import { motion } from 'framer-motion';

const HomeNew: React.FC = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const features = [
    {
      icon: Lock,
      iconColor: 'text-blue-500',
      title: 'Role-Based Access',
      description: 'Define granular permissions for AI agents based on organizational roles, ensuring secure and appropriate responses.',
    },
    {
      icon: Zap,
      iconColor: 'text-yellow-500',
      title: 'Low-Hanging Fruit',
      description: 'While others chase complexity, we\'re solving a fundamental need that every enterprise will face as they adopt AI.',
    },
    {
      icon: Building,
      iconColor: 'text-green-500',
      title: 'Enterprise Ready',
      description: 'Built for scale with enterprise-grade security, compliance, and integration capabilities from day one.',
    },
  ];

  const useCases = [
    { role: 'HR Manager', access: 'Access to employee data and HR policies' },
    { role: 'Developer', access: 'Technical documentation and code repositories' },
    { role: 'Executive', access: 'High-level metrics and strategic insights' },
    { role: 'Customer Support', access: 'Customer data and support tools' },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section with Hexagon Grid Background */}
      <section className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F7AD33' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-28 md:py-36 lg:py-36 xl:py-52 2xl:py-64">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              Command role based
              <br /> AI agents
              <br /> that work <span className="text-primary">for your organisation.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
The next frontier of AI agents for organisations:              <span className="text-primary font-semibold"> Role-Based AI Agents</span>
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/create-identity">
                <button className="btn-primary font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2">
                  <span>LAUNCH APP</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </Link>
              <Link to="/chat">
                <button className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105">
                  Try Chat Demo
                </button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Video CTA Section */}
        <div className="absolute bottom-0 right-0 w-full md:w-4/6 lg:w-1/2 xl:w-[55%] 2xl:w-1/2 bg-primary">
          <div className="relative">
            <div className="p-4 md:p-6 xl:p-8">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="relative cursor-pointer group" onClick={() => setIsVideoModalOpen(true)}>
                  <div className="w-[200px] h-[100px] md:w-[300px] md:h-[150px] xl:w-[400px] xl:h-[200px] bg-gray-800 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600">Demo Video</span>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
                    <Play className="w-12 h-12 md:w-16 md:h-16 text-white" />
                  </div>
                </div>
                <div className="text-black flex-1">
                  <h4 className="text-lg md:text-xl lg:text-2xl font-bold">Watch the magic happen!</h4>
                  <p className="text-sm md:text-base mt-2">
                    See our AI agents in action, transforming your workflows with precision and speed.
                  </p>
                </div>
              </div>
            </div>
            {/* Angled edge */}
            <div className="absolute top-0 left-0 w-16 h-full bg-black transform -skew-x-12 -translate-x-8"></div>
          </div>
        </div>
      </section>

      {/* Evolution Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-gray-800"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  The Evolution of Access Control
                </h2>
                <div className="space-y-4 text-gray-300">
                  <p className="text-lg">
                    <span className="text-primary font-semibold">Role-based API access</span> revolutionized how enterprises 
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
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 1 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-primary blur-3xl opacity-20"></div>
                  <Shield className="w-48 h-48 text-primary relative z-10" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black relative">
        {/* Angled top edge */}
        <div className="absolute top-0 left-0 w-full h-16 bg-black transform -skew-y-3 -translate-y-8"></div>
        
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 hover:border-primary transition-all h-full">
                  <feature.icon className={`w-12 h-12 ${feature.iconColor} mb-4`} />
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              How CommandHive Works
            </h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <motion.div 
                  whileHover={{ x: 10 }}
                  className="flex items-start gap-4"
                >
                  <div className="bg-primary rounded-full p-3 flex-shrink-0">
                    <Users className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Create Identity</h3>
                    <p className="text-gray-300">
                      Set up user identities with specific roles and permissions. Define what data and capabilities each role can access.
                    </p>
                  </div>
                </motion.div>
                <motion.div 
                  whileHover={{ x: 10 }}
                  className="flex items-start gap-4"
                >
                  <div className="bg-primary rounded-full p-3 flex-shrink-0">
                    <Bot className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Role-Aware Chat</h3>
                    <p className="text-gray-300">
                      AI agents automatically adapt their responses based on the user's role, providing appropriate information and actions.
                    </p>
                  </div>
                </motion.div>
              </div>
              <div className="bg-gray-900/80 rounded-xl p-8 border border-gray-800">
                <h4 className="text-lg font-bold mb-6">Example Use Cases:</h4>
                <div className="space-y-4">
                  {useCases.map((useCase, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-3"
                    >
                      <span className="text-primary text-2xl">•</span>
                      <div>
                        <span className="font-semibold">{useCase.role}:</span>
                        <span className="text-gray-300 ml-2">{useCase.access}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 bg-primary relative">
        {/* Angled edges */}
        <div className="absolute top-0 left-0 w-full h-16 bg-primary transform -skew-y-3 -translate-y-8"></div>
        
        <div className="container mx-auto px-4">
          <h4 className="text-center font-bold text-black text-2xl mb-8">OUR PARTNERS</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {[
              { id: 1, name: 'Anthropic', icon: Cloud },
              { id: 2, name: 'OpenAI', icon: Bot },
              { id: 3, name: 'Microsoft', icon: Database },
              { id: 4, name: 'Google', icon: Network },
              { id: 5, name: 'Amazon', icon: Shield },
            ].map((partner) => (
              <div key={partner.id} className="flex items-center justify-center">
                <div className="w-32 h-20 bg-black/10 rounded-lg flex items-center justify-center hover:bg-black/20 transition-colors">
                  <partner.icon className="w-8 h-8 text-black/50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Experience the Future?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Start building secure, role-aware AI agents today. No one else is focusing on this critical infrastructure - be an early adopter.
            </p>
            <Link to="/create-identity">
              <button className="btn-primary font-bold py-4 px-10 rounded-lg transition-all transform hover:scale-105 text-lg flex items-center gap-2 mx-auto">
                Create Your First Identity <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-gray-900 rounded-lg p-4 max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Video Player Placeholder</span>
            </div>
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="mt-4 text-gray-400 hover:text-white transition-colors"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default HomeNew;