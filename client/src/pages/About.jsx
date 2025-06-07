import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Navbar from '../components/Navbar';
import { Shield, Users, Globe, Award, CheckCircle, Lock } from 'lucide-react';

// Fallback Card/CardContent if you don't use @/components/ui/card
const Card = ({ children, className = "", theme }) => (
  <div className={`${
    theme === 'dark' 
      ? 'bg-gray-800 text-gray-100' 
      : 'bg-white'
  } rounded-2xl shadow-lg ${className}`}>{children}</div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-8 ${className}`}>{children}</div>
);

const About = () => {
  const { theme } = useTheme();
  
  const features = [
    {
      icon: Shield,
      title: 'Government Approved',
      description:
        'CamDID is officially approved and endorsed by the Government of Cameroon for secure digital identity management.',
    },
    {
      icon: Lock,
      title: 'Blockchain Security',
      description:
        'Built on Ethereum blockchain technology ensuring immutable, tamper-proof digital credentials.',
    },
    {
      icon: Users,
      title: 'Self-Sovereign Identity',
      description:
        'You control your own identity data. No central authority can access or modify your information without your consent.',
    },
    {
      icon: Globe,
      title: 'International Standards',
      description:
        'Compliant with W3C DID and Verifiable Credentials standards, ensuring global interoperability.',
    },
  ];

  const benefits = [
    'Instant identity verification for government services',
    'Reduced bureaucracy and paperwork',
    'Enhanced privacy and data protection',
    'Seamless integration with existing systems',
    'Mobile-first progressive web application',
    'Offline capability for essential functions',
  ];

  return (
    <div>
      <Navbar />
      <div className={`min-h-screen py-20 ${
        theme === 'dark'
          ? 'bg-gray-900'
          : 'bg-emerald-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === 'dark'
                ? 'text-emerald-400'
                : 'text-emerald-700'
            }`}>
              About CamDID
            </h1>
            <p className={`text-xl max-w-3xl mx-auto leading-relaxed ${
              theme === 'dark'
                ? 'text-gray-300'
                : 'text-gray-600'
            }`}>
              CamDID is Cameroon&apos;s first government-approved, blockchain-based digital identity management system. We&apos;re revolutionizing how citizens interact with government services through secure, self-sovereign digital identities.
            </p>
          </div>

          {/* Mission Section */}
          <Card theme={theme} className="mb-16">
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className={`text-3xl font-bold mb-6 ${
                    theme === 'dark'
                      ? 'text-emerald-400'
                      : 'text-emerald-700'
                  }`}>Our Mission</h2>
                  <p className={`text-lg mb-6 ${
                    theme === 'dark'
                      ? 'text-gray-300'
                      : 'text-gray-600'
                  }`}>
                    To provide every Cameroonian with a secure, private, and user-controlled digital identity that simplifies access to government services while protecting personal data and privacy rights.
                  </p>
                  <p className={`text-lg ${
                    theme === 'dark'
                      ? 'text-gray-300'
                      : 'text-gray-600'
                  }`}>
                    We believe that digital identity should be a fundamental right, giving individuals complete control over their personal information while enabling seamless, secure interactions with both public and private services.
                  </p>
                </div>
                <div className={`${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-emerald-900 to-emerald-700'
                    : 'bg-gradient-to-br from-green-400 to-emerald-500'
                } text-white p-8 rounded-xl`}>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Verified by Government</h3>
                        <p className="text-emerald-50">Official digital identity system</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Privacy First</h3>
                        <p className="text-emerald-50">Your data, your control</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <Globe className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Global Standards</h3>
                        <p className="text-emerald-50">International compatibility</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} theme={theme} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-full ${
                    theme === 'dark'
                      ? 'bg-emerald-900/50'
                      : 'bg-emerald-100'
                  }`}>
                    <feature.icon className={`w-6 h-6 ${
                      theme === 'dark'
                        ? 'text-emerald-400'
                        : 'text-emerald-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold mb-2 ${
                      theme === 'dark'
                        ? 'text-gray-100'
                        : 'text-gray-900'
                    }`}>{feature.title}</h3>
                    <p className={
                      theme === 'dark'
                        ? 'text-gray-400'
                        : 'text-gray-600'
                    }>{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Technical Details */}
          <Card theme={theme} className="mb-16">
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <h2 className={`text-3xl font-bold mb-6 ${
                    theme === 'dark'
                      ? 'text-emerald-400'
                      : 'text-emerald-700'
                  }`}>Technical Excellence</h2>
                  <p className={`text-lg mb-8 ${
                    theme === 'dark'
                      ? 'text-gray-300'
                      : 'text-gray-600'
                  }`}>
                    Built with cutting-edge technology and security practices to ensure your digital identity remains protected and accessible.
                  </p>
                  <div className="space-y-4">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className={
                          theme === 'dark'
                            ? 'text-emerald-400'
                            : 'text-emerald-600'
                        } />
                        <span className={
                          theme === 'dark'
                            ? 'text-gray-300'
                            : 'text-gray-700'
                        }>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700'
                      : 'bg-gray-50'
                  }`}>
                    <h4 className={`font-semibold mb-2 ${
                      theme === 'dark'
                        ? 'text-gray-100'
                        : 'text-gray-900'
                    }`}>Blockchain Technology</h4>
                    <p className={
                      theme === 'dark'
                        ? 'text-gray-300'
                        : 'text-gray-600'
                    }>Built on Ethereum for maximum security and decentralization</p>
                  </div>
                  <div className={`p-4 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700'
                      : 'bg-gray-50'
                  }`}>
                    <h4 className={`font-semibold mb-2 ${
                      theme === 'dark'
                        ? 'text-gray-100'
                        : 'text-gray-900'
                    }`}>Progressive Web App</h4>
                    <p className={
                      theme === 'dark'
                        ? 'text-gray-300'
                        : 'text-gray-600'
                    }>Works seamlessly across all devices with offline capabilities</p>
                  </div>
                  <div className={`p-4 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700'
                      : 'bg-gray-50'
                  }`}>
                    <h4 className={`font-semibold mb-2 ${
                      theme === 'dark'
                        ? 'text-gray-100'
                        : 'text-gray-900'
                    }`}>Zero-Knowledge Proofs</h4>
                    <p className={
                      theme === 'dark'
                        ? 'text-gray-300'
                        : 'text-gray-600'
                    }>Verify identity without revealing sensitive information</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Section */}
          <div className="text-center">
            <h2 className={`text-3xl font-bold mb-6 ${
              theme === 'dark'
                ? 'text-emerald-400'
                : 'text-emerald-900'
            }`}>
              Built in Partnership
            </h2>
            <p className={`text-lg max-w-3xl mx-auto mb-8 ${
              theme === 'dark'
                ? 'text-gray-300'
                : 'text-gray-600'
            }`}>
              CamDID is developed in collaboration with the Government of Cameroon, leading technology partners, and cybersecurity experts to ensure the highest standards of security and usability.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  theme === 'dark'
                    ? 'bg-blue-900/50'
                    : 'bg-blue-100'
                }`}>
                  <Shield className={`w-10 h-10 ${
                    theme === 'dark'
                      ? 'text-blue-400'
                      : 'text-blue-600'
                  }`} />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  theme === 'dark'
                    ? 'text-gray-100'
                    : 'text-gray-900'
                }`}>Government Partnership</h3>
                <p className={
                  theme === 'dark'
                    ? 'text-gray-400'
                    : 'text-gray-600'
                }>Official collaboration with Cameroon&apos;s digital transformation initiative</p>
              </div>
              <div className="text-center">
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  theme === 'dark'
                    ? 'bg-green-900/50'
                    : 'bg-green-100'
                }`}>
                  <Globe className={`w-10 h-10 ${
                    theme === 'dark'
                      ? 'text-green-400'
                      : 'text-green-600'
                  }`} />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  theme === 'dark'
                    ? 'text-gray-100'
                    : 'text-gray-900'
                }`}>International Standards</h3>
                <p className={
                  theme === 'dark'
                    ? 'text-gray-400'
                    : 'text-gray-600'
                }>Compliant with global digital identity and privacy regulations</p>
              </div>
              <div className="text-center">
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  theme === 'dark'
                    ? 'bg-purple-900/50'
                    : 'bg-purple-100'
                }`}>
                  <Users className={`w-10 h-10 ${
                    theme === 'dark'
                      ? 'text-purple-400'
                      : 'text-purple-600'
                  }`} />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  theme === 'dark'
                    ? 'text-gray-100'
                    : 'text-gray-900'
                }`}>Community Driven</h3>
                <p className={
                  theme === 'dark'
                    ? 'text-gray-400'
                    : 'text-gray-600'
                }>Built with continuous feedback from Cameroonian citizens</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;