import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import identity from '../assets/digitalID.jpeg';
import Navbar from '../components/Navbar';
import { Shield, Lock, Smartphone, Globe, Users, CheckCircle, ArrowRight, Award, Zap } from 'lucide-react';

// If you have Button and Card components as in your design system, import them here
// import { Button } from "@/components/ui/Button";
// import { Card, CardContent } from "@/components/ui/Card";

const features = [
  {
    icon: <Shield className="w-8 h-8 text-emerald-500" />,
    title: 'Secure Identity',
    description: 'Your digital identity is protected by advanced cryptography and blockchain technology.',
  },
  {
    icon: <Lock className="w-8 h-8 text-violet-600" />,
    title: 'Self-Sovereign',
    description: 'You own and control your identity data. No central authority can access it without your permission.',
  },
  {
    icon: <Smartphone className="w-8 h-8 text-orange-400" />,
    title: 'Mobile First',
    description: 'Access your digital identity anywhere, anytime with our progressive web application.',
  },
  {
    icon: <Globe className="w-8 h-8 text-emerald-500" />,
    title: 'Universal Access',
    description: 'Use your CamDID across multiple services and platforms seamlessly.',
  }
];

const benefits = [
  'Instant verification of credentials',
  'Reduced identity fraud',
  'Paperless documentation',
  'Cross-border recognition',
  'Privacy by design',
  'Government approved'
];

const howItWorks = [
  {
    number: 1,
    title: "Create Your Identity",
    description: "Set up your secure digital identity backed by blockchain technology."
  },
  {
    number: 2,
    title: "Collect Credentials",
    description: "Add verifiable credentials from trusted organizations."
  },
  {
    number: 3,
    title: "Share Securely",
    description: "Control what you share and with whom, using selective disclosure."
  },
  {
    number: 4,
    title: "Verify Credentials",
    description: "Allow others to verify your credentials securely and efficiently."
  },
  {
    number: 5,
    title: "Manage Your Wallet",
    description: "Easily manage your digital credentials and identity within your secure wallet."
  }
];

const Home = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(() => console.log('ServiceWorker registration successful'))
          .catch(error => console.error('ServiceWorker registration failed:', error));
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-400 via-emerald-500 to-orange-400 text-[#334155]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-500 via-emerald-600 to-violet-600">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="md:w-1/2 mb-12 md:mb-0"
          >
            <div className="flex justify-start mb-6">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                <Shield className="w-12 h-12 text-emerald-500" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-white">
              Your Digital Identity, <span className="block text-orange-300">Your Control</span>
            </h1>
            <p className="text-xl mb-8 text-emerald-100">
              Take control of your digital identity with our decentralized, self-sovereign 
              identity management system that puts you in charge of your personal data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-bold hover:bg-emerald-50 transition duration-300 text-center shadow-md flex items-center justify-center">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/about" className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-emerald-600 transition duration-300 text-center shadow-md">
                Learn More
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="md:w-1/2"
          >
            <img
              src={identity}
              alt="Digital Identity Illustration"
              className="w-full h-auto rounded-lg shadow-2xl border-4 border-emerald-200"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-[#f0fdf4] text-emerald-800 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-emerald-700">Why Choose CamDID?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10, scale: 1.03 }}
                className="bg-white p-8 rounded-lg shadow-lg border-l-4 border-emerald-400 text-center"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-700">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-emerald-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-emerald-700 mb-6">
                Transforming Digital Identity in Cameroon
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Join thousands of Cameroonians who are already using CamDID to simplify their digital lives. 
                From university applications to job verification, CamDID makes it easy and secure.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-emerald-900 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-700">Digital Credential</h3>
                    <p className="text-sm text-gray-500">University of Yaoundé I</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-emerald-900">Jean Dupont</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Degree:</span>
                    <span className="font-medium text-emerald-900">Computer Science</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-emerald-500 font-medium">Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-100 to-emerald-300">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-emerald-700">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="bg-white text-emerald-700 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4 border-4 border-emerald-300">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-emerald-900">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-violet-600 to-emerald-500">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-8">
            <Zap className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-emerald-50 mb-8 max-w-2xl mx-auto">
            Join the digital identity revolution. Create your CamDID account in minutes and 
            start managing your credentials securely.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-bold hover:bg-emerald-50 transition duration-300 inline-flex items-center justify-center">
              Create Account
              <Users className="w-5 h-5 ml-2" />
            </Link>
            <Link to="/login" className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-emerald-600 transition duration-300 inline-flex items-center justify-center">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-emerald-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-emerald-100">
            <p className="mb-4 md:mb-0">© 2025 CamDID, Your Digital Identity. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="hover:text-orange-300 transition duration-300">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-orange-300 transition duration-300">Terms of Service</Link>
              <Link to="/contact" className="hover:text-orange-300 transition duration-300">Contact Us</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
