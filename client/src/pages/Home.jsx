// identity-blockchain-app/client/src/pages/Home.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
// import identity from '../assets/digitalID.jpeg';
import Navbar from '../components/Navbar';
import Logo from '../assets/CamDID.svg';
import { Settings2Icon,Lock, Mail, Phone, MapPin, Smartphone, Globe, Users, CheckCircle, ArrowRight, Award, Zap, QrCode } from 'lucide-react';

// If you have Button and Card components as in your design system, import them here
// import { Button } from "@/components/ui/Button";
// import { Card, CardContent } from "@/components/ui/Card";

const features = [
  {
    icon: <Lock className="w-8 h-8 text-blue-700" />,
    title: 'Secure Identity',
    description: 'Your digital identity is protected by advanced cryptography and blockchain technology.',
  },
  {
    icon: <Settings2Icon className="w-8 h-8 text-violet-600" />,
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
    <div className="min-h-screen bg-gradient-to-b emerald-400 text-[#334155]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-emerald-500">
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
            {/* <img
              src={identity}
              alt="Digital Identity Illustration"
              className="w-full h-auto rounded-lg shadow-2xl border-4 border-emerald-200"
            /> */}
            <div className="relative bg-emerald-100 h-70 w-auto rounded-2xl p-9 shadow-lg">
              <div className="animate-float mx-auto w-80 h-48 glass-card rounded-2xl p-6 shadow-2xl bg-emerald-50/20 backdrop-blur-lg border border-emerald-800/30 hover:shadow-black-500/20 transition-all duration-300 relative overflow-hidden">
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div>
                    <h3 className="font-bold text-lg text-emerald-700">Digital Identity</h3>
                    <p className="text-sm text-emerald-800">Verified Credential</p>
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
            <div className="relative flex">
              <div className="bg-white rounded-2xl p-20 right-10 shadow-2xl">
                {/* <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-700">Digital Credential</h3>
                    <p className="text-sm text-gray-500">University of Yaoundé I</p>
                  </div>
                </div> */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-emerald-900">Justo Sinak</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Father's Name:</span>
                    <span className="font-medium text-emerald-900">xxxxxxxxxxx</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mother's Name:</span>
                    <span className="font-medium text-emerald-900">xxxxxxxxxxx</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profession:</span>
                    <span className="font-medium text-emerald-900">Student</span>
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
              <div className="h-15 w-15 p-8 border-l-4 border-emerald-400 bg-emerald-200">

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-emerald-100">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-emerald-400">
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
      {/* <footer className="bg-emerald-900 py-8">
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
      </footer> */}
      <footer className="bg-emerald-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-13 h-13 rounded-lg flex items-center justify-center">
                {/* <Shield className="w-5 h-5 text-white" /> */}
                <img src={Logo} alt="CamDID Logo" className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold">CamDID</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Secure, decentralized digital identity management for Cameroon. 
              Your identity, your control.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="w-4 h-4 text-emerald-500" />
                <span>support@camdid.cm</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="w-4 h-4 text-emerald-500" />
                <span>+237 680 312 765</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
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
            <h3 className="text-lg font-semibold mb-4 text-orange-accent">Legal</h3>
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
