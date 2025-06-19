// identity-blockchain-app/client/src/pages/Home.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
// import identity from '../assets/digitalID.jpeg';
import Navbar from '../components/Navbar';
import Logo from '../assets/CamDID.svg';
import f1 from '../assets/f1.jpg';
import { Lock, Mail, Phone, MapPin, CheckCircle, ArrowRight, QrCode, Shield, Key } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';


const Home = () => {
  const { theme } = useTheme();

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-violet-600" />,
      title: 'Secure Identity Management',
      description: 'Your digital identity is protected with state-of-the-art encryption'
    },
    {
      icon: <Key className="w-8 h-8 text-orange-400" />,
      title: 'Full Control',
      description: 'You decide who can access your credentials and when'
    },
    {
      icon: <Lock className="w-8 h-8 text-red-600" />,
      title: 'Privacy First',
      description: 'Your data is encrypted and only accessible by you'
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-blue-600" />,
      title: 'Government Verified',
      description: 'All credentials are officially verified and trusted'
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
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100' 
        : 'bg-gradient-to-b from-emerald-50 to-white text-gray-900'
    }`}>
      <Navbar />

      {/* Hero Section */}
      <section className={`relative py-20 px-4 sm:px-6 lg:px-8 ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-emerald-900 to-emerald-800'
          : 'bg-gradient-to-r from-emerald-600 to-emerald-500'
      }`}>
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="md:w-1/2 mb-12 md:mb-0"
          >
            <div className="flex justify-start mb-6">
              {/* <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                <Shield className="w-12 h-12 text-emerald-500" />
              </div> */}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-white">
              Your Digital Identity, <span className="block text-orange-300">Your Control</span>
            </h1>
            <p className="text-xl mb-8 text-emerald-100">
              Take control of your digital identity with our decentralized, self-sovereign 
              identity management system that puts you in charge of your personal data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register-as"
                className={`bg-white text-emerald-600 px-8 py-3 rounded-lg font-bold hover:bg-emerald-50 transition duration-300 text-center shadow-md flex items-center justify-center ${
                  theme === 'dark'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-white hover:bg-gray-100 text-emerald-600'
                }`}
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/login-as"
                className={`bg-white text-emerald-600 px-8 py-3 rounded-lg font-bold hover:bg-emerald-50 transition duration-300 text-center shadow-md flex items-center justify-center ${
                  theme === 'dark'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-white hover:bg-gray-100 text-emerald-600'
                }`}
              >
                Login
              </Link>
              <Link
                to="/about"
                className={`border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-emerald-600 transition duration-300 text-center shadow-md ${
                  theme === 'dark'
                    ? 'bg-emerald-900 hover:bg-emerald-800 text-white border border-emerald-700'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
              >
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
            {/* <img
              src={identity}
              alt="Digital Identity Illustration"
              className="w-full h-auto rounded-lg shadow-2xl border-4 border-emerald-200"
            /> */}
            <div className={`relative ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-emerald-100'
            } h-70 w-auto rounded-2xl p-9 shadow-lg`}>
              <div className={`animate-float mx-auto w-80 h-48 glass-card rounded-2xl p-6 shadow-2xl ${
                theme === 'dark' ? 'bg-gray-900/20 border-gray-700' : 'bg-emerald-50/20 border-emerald-800/30'
              } backdrop-blur-lg hover:shadow-black-500/20 transition-all duration-300 relative overflow-hidden`}>
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div>
                    <h3 className={`font-bold text-lg ${
                      theme === 'dark' ? 'text-gray-100' : 'text-emerald-700'
                    }`}>Digital Identity</h3>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-emerald-800'
                    }`}>Verified Credential</p>
                  </div>
                  <QrCode className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-2 relative z-10">
                  <div className="h-2 bg-emerald-400/30 rounded-full w-3/4"></div>
                  <div className="h-2 bg-emerald-600/20 rounded-full w-1/2"></div>
                  <div className="h-2 bg-emerald-400/30 rounded-full w-2/3"></div>
                </div>
                {/* Animated circles */}
                <div className="absolute top-0 left-0 w-full h-full">
                  <div className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-emerald-400/40 to-violet-500/40 blur-xl animate-orbit-1"></div>
                  <div className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-orange-400/40 to-pink-500/40 blur-xl animate-orbit-2"></div>
                  <div className="absolute w-16 h-16 rounded-full bg-gradient-to-r from-blue-400/40 to-emerald-500/40 blur-xl animate-orbit-3"></div>
                </div>
                <div className="absolute bottom-4 right-4 w-12 h-12 bg-gradient-to-br from-emerald-400 to-violet-500 rounded-full opacity-80 animate-pulse"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`${
        theme === 'dark' ? 'bg-gray-900 text-gray-400' : 'bg-emerald-50 text-emerald-800'
      } py-20`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${
            theme === 'dark' ? 'text-gray-400' : 'text-emerald-700'
          }`}>Why Choose CamDID?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -10, scale: 1.03 }}
                  className={`${theme === 'dark' ? 'bg-gray-800 shadow-lg shadow-gray-900/50 border-l-4 border-violet-400 text-gray-100' : 'bg-white shadow-lg border-l-4 border-emerald-400 text-emerald-800'} p-8 rounded-lg`}
                >
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-emerald-700'}`}>
                    {feature.title}
                  </h3>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {feature.description}
                  </p>
                </motion.div>
              ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-emerald-50'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${
                theme === 'dark' ? 'text-gray-100' : 'text-emerald-700'
              }`}>
                Transforming Digital Identity in Cameroon
              </h2>
              <p className={`mb-8 leading-relaxed ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Join thousands of Cameroonians who are already using CamDID to simplify their digital lives. 
                From university applications to job verification, CamDID makes it easy and secure.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className={`flex items-center space-x-3 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-emerald-900'
                  }`}>
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className={`font-medium ${
                      theme === 'dark' ? 'text-gray-400' : 'text-emerald-900'
                    }`}>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={`relative ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-emerald-100'
            } rounded-2xl p-9 shadow-lg`}>
              <div className={`space-y-4 flex justify-between p-6 rounded-xl ${
                theme === 'dark' ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-emerald-100'
              } shadow-lg relative overflow-hidden`}>
                {/* Left side - Personal Information */}
                <div className="space-y-3 flex-grow">
                  <div className="mb-6">
                    <h3 className={`text-lg font-semibold mb-1 ${
                      theme === 'dark' ? 'text-gray-100' : 'text-emerald-700'
                    }`}>Digital Identity Card</h3>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>ID: CM-2025-0123-4567</p>
                  </div>
                  <div className="space-y-3">
                    <div className={`flex justify-between items-center border-b pb-2 ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
                    }`}>
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>Full Name:</span>
                      <span className={`font-medium ${
                        theme === 'dark' ? 'text-gray-100' : 'text-emerald-900'
                      }`}>Justo Sinak</span>
                    </div>
                    <div className={`flex justify-between items-center border-b pb-2 ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
                    }`}>
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>Date of Birth:</span>
                      <span className={`font-medium ${
                        theme === 'dark' ? 'text-gray-100' : 'text-emerald-900'
                      }`}>15/03/1995</span>
                    </div>
                    <div className={`flex justify-between items-center border-b pb-2 ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
                    }`}>
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>Nationality:</span>
                      <span className={`font-medium ${
                        theme === 'dark' ? 'text-gray-100' : 'text-emerald-900'
                      }`}>Cameroonian</span>
                    </div>
                    <div className={`flex justify-between items-center border-b pb-2 ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
                    }`}>
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>Gender:</span>
                      <span className={`font-medium ${
                        theme === 'dark' ? 'text-gray-100' : 'text-emerald-900'
                      }`}>Male</span>
                    </div>
                    <div className={`flex justify-between items-center border-b pb-2 ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
                    }`}>
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>Profession:</span>
                      <span className={`font-medium ${
                        theme === 'dark' ? 'text-gray-100' : 'text-emerald-900'
                      }`}>Student</span>
                    </div>
                    <div className={`flex justify-between items-center ${
                      theme === 'dark' ? 'border-gray-700' : ''
                    }`}>
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : ''
                      }`}>Status:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-emerald-500 font-medium text-sm">Verified</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side - Photo and QR */}
                <div className="flex flex-col items-center space-y-4 ml-6 min-w-[140px]">
                  <div className={`w-32 h-40 rounded-lg overflow-hidden border-2 ${
                    theme === 'dark' ? 'border-gray-700' : 'border-emerald-200'
                  }`}>
                    <img
                      // src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop"
                      src={f1}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className={`w-20 h-20 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  } rounded-lg flex items-center justify-center`}>
                    <QrCode className="w-16 h-16 text-emerald-700 opacity-20" />
                  </div>
                </div>

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className={`absolute inset-0 ${
                    theme === 'dark' ? 'bg-gradient-to-r from-emerald-700 to-emerald-900' : 'bg-gradient-to-r from-emerald-500 to-emerald-700'
                  }`}></div>
                  <div className="absolute inset-0 bg-grid-emerald-500/30"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="w-full mt-0 bg-gradient-to-r from-emerald-900 to-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand & Contact */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className={`w-13 h-13 rounded-lg flex items-center justify-center ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <img src={Logo} alt="CamDID Logo" className="w-6 h-6" />
                </div>
                <p className={`text-xl font-bold ${
                  theme === 'dark'
                }`}><span className={`text-emerald-700 ${
                  theme === 'dark' ? 'text-emerald-400' : 'text-emerald-500'
                }`}>Cam</span><span className={`text-red-700 ${
                  theme === 'dark' ? 'text-red-900' : 'text-red-500'
                }`}>DID</span></p>
              </div>
              <p className={`mb-4 max-w-md ${
                theme === 'dark' ? 'text-gray-400' : 'text-emerald-50'
              }`}>
                Secure, decentralized digital identity management for Cameroon. <br />
                Your identity, your control.
              </p>
              <div className="space-y-2">
                <div className={`flex items-center space-x-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-emerald-50'
                }`}>
                  <Mail className="w-4 h-4 text-emerald-500" />
                  <span>support@camdid.cm</span>
                </div>
                <div className={`flex items-center space-x-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-emerald-50'
                }`}>
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <span>+237 680 312 765</span>
                </div>
                <div className={`flex items-center space-x-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-emerald-50'
                }`}>
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span>Douala, Cameroon</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-emerald-500">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-emerald-500 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-300 hover:text-emerald-500 transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="text-gray-300 hover:text-emerald-500 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/wallet" className="text-gray-300 hover:text-emerald-500 transition-colors">
                    Wallet
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-red-700">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-gray-300 hover:text-orange-accent transition-colors">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-300 hover:text-orange-accent transition-colors">Terms of Service</Link>
                </li>
                <li>
                  <Link to="/security" className="text-gray-300 hover:text-orange-accent transition-colors">Security</Link>
                </li>
                <li>
                  <Link to="/support" className="text-gray-300 hover:text-orange-accent transition-colors">Support</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-600 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 CamDID. All rights reserved. Built with security and privacy in mind.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
