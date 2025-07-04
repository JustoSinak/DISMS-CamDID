import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Shield, Lock, Smartphone, Globe } from 'lucide-react';
import Layout from '../components/Layout';
import { useTheme } from '../contexts/ThemeContext';

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`border-b ${
      theme === 'dark' ? 'border-gray-700' : 'border-emerald-100'
    } last:border-0`}>
      <button
        className="w-full py-6 text-left focus:outline-none flex justify-between items-center"
        onClick={onClick}
      >
        <span className={`text-lg font-medium ${
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>{question}</span>
        {isOpen ? (
          <ChevronUp className={`w-5 h-5 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-900'
          }`} />
        ) : (
          <ChevronDown className={`w-5 h-5 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-900'
          }`} />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className={`pb-6 leading-relaxed space-y-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const { theme } = useTheme();

  const faqCategories = [
    {
      title: "General Questions",
      icon: <Shield className="w-6 h-6 text-emerald-600" />,
      questions: [
        {
          question: "What is CamDID?",
          answer: (
            <>
              <p>CamDID is Cameroon's first decentralized digital identity system that allows citizens to:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>Create and manage their digital identity</li>
                <li>Store verified credentials securely</li>
                <li>Share identity information selectively</li>
                <li>Access various services seamlessly</li>
              </ul>
            </>
          )
        },
        {
          question: "How does CamDID work?",
          answer: "CamDID uses blockchain technology and advanced cryptography to create a secure, decentralized identity system. Users can create their digital identity, receive verified credentials from authorized institutions, and share their information securely with service providers while maintaining full control over their personal data."
        },
        {
          question: "Is CamDID free to use?",
          answer: "Yes, CamDID is free for individual users. Basic identity creation and management features are provided at no cost. However, some advanced features or institutional services may require payment."
        }
      ]
    },
    {
      title: "Security & Privacy",
      icon: <Lock className="w-6 h-6 text-emerald-600" />,
      questions: [
        {
          question: "How secure is my digital identity?",
          answer: "Your digital identity is secured using state-of-the-art encryption and blockchain technology. Your personal data is never stored centrally - instead, it's encrypted and only accessible with your private keys. We use industry-standard security protocols and regular security audits to ensure the highest level of protection."
        },
        {
          question: "Who can access my information?",
          answer: "Only you have full access to your information. When you need to share your credentials, you can choose exactly what information to share and with whom. Service providers can only access the specific information you authorize, and this access can be revoked at any time."
        },
        {
          question: "What happens if I lose my device?",
          answer: "CamDID implements a secure recovery process. You can restore access to your digital identity using a combination of recovery methods, including backup phrases, trusted contacts, or official identity verification. We recommend setting up multiple recovery options when creating your account."
        }
      ]
    },
    {
      title: "Using CamDID",
      icon: <Smartphone className="w-6 h-6 text-emerald-600" />,
      questions: [
        {
          question: "How do I get started with CamDID?",
          answer: (
            <>
              <p>Getting started with CamDID is simple:</p>
              <ol className="list-decimal pl-5 mt-2">
                <li>Create an account using your email</li>
                <li>Verify your identity through our secure process</li>
                <li>Set up your digital wallet</li>
                <li>Start receiving and managing your digital credentials</li>
              </ol>
            </>
          )
        },
        {
          question: "What types of credentials can I store?",
          answer: "CamDID supports various types of credentials including national ID, educational certificates, professional qualifications, health records, and more. Any authorized institution can issue digital credentials that you can store securely in your CamDID wallet."
        }
      ]
    },
    {
      title: "Technical Support",
      icon: <Globe className="w-6 h-6 text-emerald-600" />,
      questions: [
        {
          question: "What devices are supported?",
          answer: "CamDID is accessible through any modern web browser on desktop and mobile devices. We also offer dedicated mobile apps for Android and iOS for a better user experience."
        },
        {
          question: "How can I get help if I have problems?",
          answer: "We offer multiple support channels: 24/7 chat support, email support at support@camdid.cm, and phone support during business hours. You can also visit our help center for detailed guides and troubleshooting tips."
        }
      ]
    }
  ];

  return (
    <Layout>
      <div className={`min-h-screen ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-gray-900 to-gray-800'
          : 'bg-gradient-to-b from-emerald-50 to-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="text-center mb-16">
            <h1 className={`text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-emerald-900'
            }`}>
              Frequently Asked Questions
            </h1>
            <p className={`text-lg max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
            }`}>
              Find answers to common questions about CamDID and digital identity management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className={`rounded-2xl shadow-lg p-6 ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center gap-3 mb-6">
                  {React.cloneElement(category.icon, {
                    className: `w-6 h-6 ${
                      theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                    }`
                  })}
                  <h2 className={`text-xl font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-emerald-900'
                  }`}>
                    {category.title}
                  </h2>
                </div>
                <div className={`divide-y ${
                  theme === 'dark' ? 'divide-gray-700' : 'divide-emerald-100'
                }`}>
                  {category.questions.map((faq, index) => (
                    <FAQItem
                      key={index}
                      question={faq.question}
                      answer={faq.answer}
                      isOpen={openIndex === `${categoryIndex}-${index}`}
                      onClick={() => setOpenIndex(openIndex === `${categoryIndex}-${index}` ? null : `${categoryIndex}-${index}`)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-16 text-center">
            <h2 className={`text-2xl font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-emerald-900'
            }`}>
              Still have questions?
            </h2>
            <p className={`mb-6 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
            }`}>
              We're here to help. Contact our support team for assistance.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="mailto:support@camdid.cm"
                className={`inline-flex items-center px-6 py-3 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                Contact Support
              </a>
              <a
                href="/contact"
                className={`inline-flex items-center px-6 py-3 rounded-lg border-2 transition-colors ${
                  theme === 'dark'
                    ? 'border-emerald-500 text-emerald-400 hover:bg-emerald-900'
                    : 'border-emerald-600 text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                Visit Help Center
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQ; 