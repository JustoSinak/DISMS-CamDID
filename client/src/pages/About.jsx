import React from 'react';
import Navbar from '../components/Navbar';
import { Shield, Users, Globe, Award, CheckCircle, Lock } from 'lucide-react';

// Fallback Card/CardContent if you don't use @/components/ui/card
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-lg ${className}`}>{children}</div>
);
const CardContent = ({ children, className = "" }) => (
  <div className={`p-8 ${className}`}>{children}</div>
);

const About = () => {
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
    <div className="min-h-screen bg-emerald-100 py-12">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About CamDID
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            CamDID is Cameroon&apos;s first government-approved, blockchain-based digital identity management system. We&apos;re revolutionizing how citizens interact with government services through secure, self-sovereign digital identities.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                To provide every Cameroonian with a secure, private, and user-controlled digital identity that simplifies access to government services while protecting personal data and privacy rights.
              </p>
              <p className="text-lg text-gray-600">
                We believe that digital identity should be a fundamental right, giving individuals complete control over their personal information while enabling seamless, secure interactions with both public and private services.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-8 rounded-xl">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">50,000+</p>
                    <p className="text-blue-100">Verified Users</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">99.9%</p>
                    <p className="text-blue-100">Security Rating</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">2024</p>
                    <p className="text-blue-100">Government Approved</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why CamDID is Different
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Benefits for Citizens
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900">
                Technical Excellence
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Blockchain Technology</h4>
                  <p className="text-gray-600">Built on Ethereum for maximum security and decentralization</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Progressive Web App</h4>
                  <p className="text-gray-600">Works seamlessly across all devices with offline capabilities</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Zero-Knowledge Proofs</h4>
                  <p className="text-gray-600">Verify identity without revealing sensitive information</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Built in Partnership
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            CamDID is developed in collaboration with the Government of Cameroon, leading technology partners, and cybersecurity experts to ensure the highest standards of security and usability.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Shield className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Government Partnership</h3>
              <p className="text-gray-600 mt-2">Official collaboration with Cameroon&apos;s digital transformation initiative</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Globe className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">International Standards</h3>
              <p className="text-gray-600 mt-2">Compliant with global digital identity and privacy regulations</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Community Driven</h3>
              <p className="text-gray-600 mt-2">Built with continuous feedback from Cameroonian citizens</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default About;