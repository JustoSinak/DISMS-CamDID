import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import {
  Shield,
  GraduationCap,
  FileText,
  Stethoscope,
  Banknote,
  Award,
  Car
} from 'lucide-react';

const ChooseCredentialType = () => {
  const navigate = useNavigate();

  const credentialTypes = useMemo(() => [
    {
      name: 'National ID Card',
      description: 'Create a verifiable credential for your National Identity Card with government verification.',
      icon: Shield,
      category: 'Government',
      color: 'bg-blue-500',
      type: 'national-id',
      link: '/create-credential/national-id',
    },
    {
      name: 'Driver\'s License',
      description: 'Create a verifiable credential for your Driver\'s License with driving authority verification.',
      icon: Car,
      category: 'Government',
      color: 'bg-green-500',
      type: 'drivers-license',
      link: '/create-credential/drivers-license',
    },
    {
      name: 'Passport',
      description: 'Create a verifiable credential for your Passport with immigration authority verification.',
      icon: FileText,
      category: 'Government',
      color: 'bg-purple-500',
      type: 'passport',
      link: '/create-credential/passport',
    },
    {
      name: 'Birth Certificate',
      description: 'Create a verifiable credential for your Birth Certificate with civil registry verification.',
      icon: FileText,
      category: 'Government',
      color: 'bg-indigo-500',
      type: 'birth-certificate',
      link: '/create-credential/birth-certificate',
    },
    {
      name: 'University Degree',
      description: 'Create a verifiable credential for your academic degree with university verification.',
      icon: GraduationCap,
      category: 'Education',
      color: 'bg-orange-500',
      type: 'degree',
      link: '/create-credential/degree',
    },
    {
      name: 'Professional Certificate',
      description: 'Create a verifiable credential for your professional certification.',
      icon: Award,
      category: 'Professional',
      color: 'bg-pink-500',
      type: 'professional-certificate',
      link: '/create-credential/professional-certificate',
    },
    {
      name: 'Medical License',
      description: 'Create a verifiable credential for your medical practice license.',
      icon: Stethoscope,
      category: 'Medical',
      color: 'bg-teal-500',
      type: 'medical-license',
      link: '/create-credential/medical-license',
    },
    {
      name: 'Bank Account',
      description: 'Create a verifiable credential for your bank account information.',
      icon: Banknote,
      category: 'Financial',
      color: 'bg-yellow-500',
      type: 'bank-account',
      link: '/create-credential/bank-account',
    }
  ], []);

  const groupedCredentials = credentialTypes.reduce((acc, credential) => {
    if (!acc[credential.category]) {
      acc[credential.category] = [];
    }
    acc[credential.category].push(credential);
    return acc;
  }, {});

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Credential Type
            </h1>
            <p className="text-lg text-gray-600">
              Select the type of credential you want to create
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Filter by Category
            </label>
            <select
              id="category"
              name="category"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
              onChange={(e) => {
                // TODO: Implement filtering logic
              }}
            >
              <option value="">All Categories</option>
              <option value="Government">Government</option>
              <option value="Education">Education</option>
              <option value="Professional">Professional</option>
              <option value="Medical">Medical</option>
              <option value="Financial">Financial</option>
            </select>
          </div>

          <div className="space-y-8">
            {Object.entries(groupedCredentials).map(([category, credentials]) => (
              <div key={category} className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="bg-gray-200 rounded-full px-3 py-1 text-sm mr-3">
                    {category}
                  </span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {credentials.map((credential, index) => {
                    const IconComponent = credential.icon;
                    return (
                      <div
                        key={index}
                        onClick={() => navigate(credential.link)}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-emerald-300 transition-all duration-200 cursor-pointer group"
                      >
                        <div className="flex flex-col items-center text-center space-y-4">
                          <div className={`${credential.color} rounded-lg p-3 group-hover:scale-110 transition-transform duration-200`}>
                            <IconComponent className="w-8 h-8 text-white" />
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {credential.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {credential.description}
                            </p>
                          </div>
                          
                          <div className="pt-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 group-hover:bg-emerald-200 transition-colors duration-200">
                              Create Now
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/dashboard/citizen')}
              className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ChooseCredentialType;