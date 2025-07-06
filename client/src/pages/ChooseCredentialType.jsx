
import { useNavigate } from 'react-router-dom';

const ChooseCredentialType = () => {
  const navigate = useNavigate();

  const credentialTypes = [
    {
      name: 'National ID Card',
      description: 'Create a verifiable credential for your National Identity Card with government verification.',
      category: 'Government',
      color: 'bg-blue-500',
      link: '/create-identity', // Navigate to CreateIdentity for ID cards
    },
    {
      name: 'Educational Certificate',
      description: 'Create credentials for diplomas, degrees, and other educational achievements.',
      category: 'Education',
      color: 'bg-green-500',
      link: '/create-credential/education',
    },
    {
      name: 'Professional License',
      description: 'Create verifiable credentials for professional licenses and certifications.',
      category: 'Professional',
      color: 'bg-purple-500',
      link: '/create-credential/professional',
    },
    {
      name: 'Security Clearance',
      description: 'Create credentials for security clearances and background checks.',
      category: 'Security',
      color: 'bg-red-500',
      link: '/create-credential/security',
    },
    {
      name: 'Medical Records',
      description: 'Create verifiable credentials for medical records and health certificates.',
      category: 'Healthcare',
      color: 'bg-pink-500',
      link: '/create-credential/medical',
    },
    {
      name: 'Achievement Badge',
      description: 'Create credentials for awards, recognitions, and achievements.',
      category: 'Recognition',
      color: 'bg-yellow-500',
      link: '/create-credential/achievement',
    },
    {
      name: 'Business License',
      description: 'Create verifiable credentials for business licenses and permits.',
      category: 'Business',
      color: 'bg-indigo-500',
      link: '/create-credential/business',
    },
    {
      name: 'Membership Card',
      description: 'Create credentials for organization memberships and affiliations.',
      category: 'Membership',
      color: 'bg-teal-500',
      link: '/create-credential/membership',
    }
  ];

  const handleCredentialSelect = (credentialType) => {
    navigate(credentialType.link);
  };

  return (
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

        {/* All credentials in 3 columns */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {credentialTypes.map((credential, index) => {
            return (
              <div
                key={index}
                onClick={() => handleCredentialSelect(credential)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-emerald-300 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`${credential.color} rounded-lg p-3 group-hover:scale-110 transition-transform duration-200 w-16 h-16 flex items-center justify-center`}>
                    <span className="text-white text-2xl font-bold">
                      {credential.name.charAt(0)}
                    </span>
                  </div>

                  <div>
                    <div className="mb-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                        {credential.category}
                      </span>
                    </div>
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
  );
};

export default ChooseCredentialType;