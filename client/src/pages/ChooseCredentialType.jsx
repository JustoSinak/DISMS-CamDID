import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/common/Card';
import { 
  IdCard, 
  Award, 
  BookOpen, 
  Car, 
  GraduationCap, 
  Stethoscope, 
  Banknote, 
  FileText,
  Shield
} from 'lucide-react';

const ChooseCredentialType = () => {
  const credentialTypes = [
    {
      name: 'National ID Card',
      description: 'Create a verifiable credential for your National Identity Card with government verification.',
      icon: IdCard,
      category: 'Government',
      color: 'bg-blue-500',
      link: '/create-credential/national-id',
    },
    {
      name: 'Driver\'s License',
      description: 'Create a verifiable credential for your Driver\'s License with driving authority verification.',
      icon: Car,
      category: 'Government',
      color: 'bg-green-500',
      link: '/create-credential/drivers-license',
    },
    {
      name: 'Passport',
      description: 'Create a verifiable credential for your Passport with immigration authority verification.',
      icon: Shield,
      category: 'Government',
      color: 'bg-purple-500',
      link: '/create-credential/passport',
    },
      {
        name: 'Birth Certificate',
        description: 'Create a verifiable credential for your Birth Certificate with civil registry verification.',
        icon: FileText,
        category: 'Government',
        color: 'bg-indigo-500',
        link: '/create-credential/birth-certificate',
      },
    {
      name: 'Academic Diploma',
      description: 'Create a verifiable credential for your Academic Diploma with educational institution verification.',
      icon: GraduationCap,
      category: 'Educational',
      color: 'bg-emerald-500',
      link: '/create-credential/academic-diploma',
    },
    {
      name: 'Professional Certificate',
      description: 'Create a verifiable credential for your Professional Certificate with certification body verification.',
      icon: Award,
      category: 'Professional',
      color: 'bg-orange-500',
      link: '/create-credential/professional-certificate',
    },
    {
      name: 'Medical Record',
      description: 'Create a verifiable credential for your Medical Record with healthcare provider verification.',
      icon: Stethoscope,
      category: 'Health',
      color: 'bg-red-500',
      link: '/create-credential/medical-record',
    },
    {
      name: 'Bank Statement',
      description: 'Create a verifiable credential for your Bank Statement with financial institution verification.',
      icon: Banknote,
      category: 'Financial',
      color: 'bg-yellow-500',
      link: '/create-credential/bank-statement',
    },
    {
      name: 'Employment Certificate',
      description: 'Create a verifiable credential for your Employment Certificate with employer verification.',
      icon: FileText,
      category: 'Professional',
      color: 'bg-teal-500',
      link: '/create-credential/employment-certificate',
    },
    {
      name: 'Vaccination Record',
      description: 'Create a verifiable credential for your Vaccination Record with healthcare provider verification.',
      icon: Stethoscope,
      category: 'Health',
      color: 'bg-pink-500',
      link: '/create-credential/vaccination-record',
    },
    {
      name: 'Credit Report',
      description: 'Create a verifiable credential for your Credit Report with credit bureau verification.',
      icon: Banknote,
      category: 'Financial',
      color: 'bg-cyan-500',
      link: '/create-credential/credit-report',
    },
    {
      name: 'Training Certificate',
      description: 'Create a verifiable credential for your Training Certificate with training provider verification.',
      icon: BookOpen,
      category: 'Educational',
      color: 'bg-lime-500',
      link: '/create-credential/training-certificate',
    }
  ];

  const categories = [...new Set(credentialTypes.map(type => type.category))];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Credential Type</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select the type of verifiable credential you want to create. Each credential type is verified by the appropriate authority.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button className="px-6 py-2 rounded-full bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors">
              All Types
            </button>
            {categories.map(category => (
              <button
                key={category}
                className="px-6 py-2 rounded-full bg-white text-gray-700 font-medium hover:bg-gray-100 transition-colors border border-gray-200"
              >
                {category}
              </button>
            ))}
          </div>

          {/* Credential Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {credentialTypes.map((type) => (
              <Card key={type.name} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <Link to={type.link} className="block p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${type.color} text-white`}>
                      <type.icon className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                      {type.category}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">{type.name}</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">{type.description}</p>
                  <div className="mt-4">
                    <span className="inline-flex items-center text-emerald-600 text-sm font-medium">
                      Create Credential
                      <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </Card>
            ))}
          </div>

          {/* Back to Dashboard */}
          <div className="mt-12 text-center">
            <Link 
              to="/dashboard/citizen" 
              className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ChooseCredentialType;
