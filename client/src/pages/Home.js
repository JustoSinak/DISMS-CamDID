import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import identity from '../assets/digitalID.jpeg';
import Navbar from '../components/Navbar';
import Header from '../components/Header'


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
      {/* <Header /> */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="md:w-1/2 mb-8 md:mb-0"
          >
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-emerald-900">
              Your Digital Identity, Secured by Blockchain
            </h1>
            <p className="text-xl mb-8 text-emerald-800">
              Take control of your digital identity with our decentralized, self-sovereign 
              identity management system that puts you in charge of your personal data.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/register" className="bg-emerald-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-600 transition duration-300 text-center shadow-md">
                Get Started
              </Link>
              <Link to="/login" className="border-2 border-emerald-800 text-emerald-700 px-8 py-3 rounded-lg font-bold hover:bg-emerald-100 hover:text-emerald-900 transition duration-300 text-center shadow-md">
                Sign In
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
      </div>

      {/* Features Section */}
      <div id="features" className="bg-[#f0fdf4] text-emerald-800 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-emerald-700">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon="shield-check"
              title="Self-Sovereign Identity"
              description="Own your identity. Control your data. You decide what to share and with whom."
            />
            <FeatureCard 
              icon="lock-closed"
              title="Blockchain Verification"
              description="Immutable proof of your credentials secured by blockchain technology."
            />
            <FeatureCard 
              icon="document-duplicate"
              title="Selective Disclosure"
              description="Share only what's necessary. Reveal specific attributes without exposing everything."
            />
            <FeatureCard 
              icon="qrcode"
              title="Easy Sharing"
              description="Share your identity securely with a simple QR code."
            />
            <FeatureCard 
              icon="finger-print"
              title="Biometric Security"
              description="Lock your identity with your unique biometric data for maximum security."
            />
            <FeatureCard 
              icon="device-mobile"
              title="Mobile-First Design"
              description="Access your identity anytime, anywhere, from any device."
            />
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-gradient-to-r from-emerald-100 to-emerald-300">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-emerald-700">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard 
              number="1"
              title="Create Your Identity"
              description="Set up your secure digital identity backed by blockchain technology."
            />
            <StepCard 
              number="2"
              title="Collect Credentials"
              description="Add verifiable credentials from trusted organizations."
            />
            <StepCard 
              number="3"
              title="Share Securely"
              description="Control what you share and with whom, using selective disclosure."
            />
            <StepCard
              number="4"
              title="Verify Credentials"
              description="Allow others to verify your credentials securely and efficiently."
            />
            <StepCard
              number="5"
              title="Manage Your Wallet"
              description="Easily manage your digital credentials and identity within your secure wallet."
            />

          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-emerald-500 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Ready to Take Control of Your Digital Identity?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-emerald-100">
            Join thousands of users who have already secured their digital identity with our blockchain solution.
          </p>
          <Link to="/register" className="bg-white text-emerald-700 px-8 py-3 rounded-lg font-bold hover:bg-emerald-100 hover:text-emerald-900 transition duration-300 inline-block shadow-lg">
            Get Started Now
          </Link>
        </div>
      </div>

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

// Helper Components
const FeatureCard = ({ icon, title, description }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="bg-emerald-50 p-6 rounded-lg shadow-lg border-l-4 border-orange-400"
  >
    <div className="text-emerald-500 mb-4">
      <i className={`fas fa-${icon} text-3xl`}></i>
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-700">{description}</p>
  </motion.div>
);

const StepCard = ({ number, title, description }) => (
  <div className="flex flex-col items-center text-center">
    <div className="bg-white text-emerald-700 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4 border-4 border-emerald-300">
      {number}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-emerald-900">{description}</p>
  </div>
);

export default Home;
