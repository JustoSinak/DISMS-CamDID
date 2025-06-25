// import React from 'react';
// import { Link } from 'react-router-dom';
// import MainLayout from '../layouts/MainLayout';
// import Card from '../components/common/Card';
// import { 
//   IdCard, 
//   Award, 
//   BookOpen, 
//   Car, 
//   GraduationCap, 
//   Stethoscope, 
//   Banknote, 
//   FileText,
//   Shield
// } from 'lucide-react';

// const ChooseCredentialType = () => {
//   const credentialTypes = [
//       {
//         name: 'National ID Card',
//         description: 'Create a verifiable credential for your National Identity Card with government verification.',
//         icon: IdCard,
//         category: 'Government',
//         color: 'bg-blue-500',
//         link: '/create-identity', // Updated route to match App.jsx routing
//       },
//     {
//       name: 'Driver\'s License',
//       description: 'Create a verifiable credential for your Driver\'s License with driving authority verification.',
//       icon: Car,
//       category: 'Government',
//       color: 'bg-green-500',
//       link: '/create-credential/drivers-license',
//     },
//     {
//       name: 'Passport',
//       description: 'Create a verifiable credential for your Passport with immigration authority verification.',
//       icon: Shield,
//       category: 'Government',
//       color: 'bg-purple-500',
//       link: '/create-credential/passport',
//     },
//       {
//         name: 'Birth Certificate',
//         description: 'Create a verifiable credential for your Birth Certificate with civil registry verification.',
//         icon: FileText,
//         category: 'Government',
//         color: 'bg-indigo-500',
//         link: '/create-credential/birth-certificate',
//       },
//     {
//       name: 'Academic Diploma',
//       description: 'Create a verifiable credential for your Academic Diploma with educational institution verification.',
//       icon: GraduationCap,
//       category: 'Educational',
//       color: 'bg-emerald-500',
//       link: '/create-credential/academic-diploma',
//     },
//     {
//       name: 'Professional Certificate',
//       description: 'Create a verifiable credential for your Professional Certificate with certification body verification.',
//       icon: Award,
//       category: 'Professional',
//       color: 'bg-orange-500',
//       link: '/create-credential/professional-certificate',
//     },
//     {
//       name: 'Medical Record',
//       description: 'Create a verifiable credential for your Medical Record with healthcare provider verification.',
//       icon: Stethoscope,
//       category: 'Health',
//       color: 'bg-red-500',
//       link: '/create-credential/medical-record',
//     },
//     {
//       name: 'Bank Statement',
//       description: 'Create a verifiable credential for your Bank Statement with financial institution verification.',
//       icon: Banknote,
//       category: 'Financial',
//       color: 'bg-yellow-500',
//       link: '/create-credential/bank-statement',
//     },
//     {
//       name: 'Employment Certificate',
//       description: 'Create a verifiable credential for your Employment Certificate with employer verification.',
//       icon: FileText,
//       category: 'Professional',
//       color: 'bg-teal-500',
//       link: '/create-credential/employment-certificate',
//     },
//     {
//       name: 'Vaccination Record',
//       description: 'Create a verifiable credential for your Vaccination Record with healthcare provider verification.',
//       icon: Stethoscope,
//       category: 'Health',
//       color: 'bg-pink-500',
//       link: '/create-credential/vaccination-record',
//     },
//     {
//       name: 'Credit Report',
//       description: 'Create a verifiable credential for your Credit Report with credit bureau verification.',
//       icon: Banknote,
//       category: 'Financial',
//       color: 'bg-cyan-500',
//       link: '/create-credential/credit-report',
//     },
//     {
//       name: 'Training Certificate',
//       description: 'Create a verifiable credential for your Training Certificate with training provider verification.',
//       icon: BookOpen,
//       category: 'Educational',
//       color: 'bg-lime-500',
//       link: '/create-credential/training-certificate',
//     }
//   ];

//   const categories = [...new Set(credentialTypes.map(type => type.category))];

//   return (
//     <MainLayout>
//       <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-12">
//             <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Credential Type</h1>
//             <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//               Select the type of verifiable credential you want to create. Each credential type is verified by the appropriate authority.
//             </p>
//           </div>

//           {/* Category Filter */}
//           <div className="flex flex-wrap justify-center gap-4 mb-8">
//             <button className="px-6 py-2 rounded-full bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors">
//               All Types
//             </button>
//             {categories.map(category => (
//               <button
//                 key={category}
//                 className="px-6 py-2 rounded-full bg-white text-gray-700 font-medium hover:bg-gray-100 transition-colors border border-gray-200"
//               >
//                 {category}
//               </button>
//             ))}
//           </div>

//           {/* Credential Types Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {credentialTypes.map((type) => (
//               <Card key={type.name} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
//                 <Link to={type.link} className="block p-6 text-center">
//                   <div className="flex justify-center mb-4">
//                     <div className={`p-3 rounded-full ${type.color} text-white`}>
//                       <type.icon className="w-8 h-8" />
//                     </div>
//                   </div>
//                   <div className="mb-2">
//                     <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
//                       {type.category}
//                     </span>
//                   </div>
//                   <h2 className="text-lg font-semibold text-gray-900 mb-3">{type.name}</h2>
//                   <p className="text-gray-600 text-sm leading-relaxed">{type.description}</p>
//                   <div className="mt-4">
//                     <span className="inline-flex items-center text-emerald-600 text-sm font-medium">
//                       Create Credential
//                       <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                       </svg>
//                     </span>
//                   </div>
//                 </Link>
//               </Card>
//             ))}
//           </div>

//           {/* Back to Dashboard */}
//           <div className="mt-12 text-center">
//             <Link 
//               to="/dashboard/citizen" 
//               className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
//             >
//               <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//               </svg>
//               Back to Dashboard
//             </Link>
//           </div>
//         </div>
//       </div>
//     </MainLayout>
//   );
// };

// export default ChooseCredentialType;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IdCard, 
  GraduationCap, 
  Briefcase, 
  Shield, 
  Heart, 
  Award,
  FileText,
  Users
} from 'lucide-react';

const ChooseCredentialType = () => {
  const navigate = useNavigate();

  const credentialTypes = [
    {
      name: 'National ID Card',
      description: 'Create a verifiable credential for your National Identity Card with government verification.',
      icon: IdCard,
      category: 'Government',
      color: 'bg-blue-500',
      link: '/create-identity', // Navigate to CreateIdentity for ID cards
    },
    {
      name: 'Educational Certificate',
      description: 'Create credentials for diplomas, degrees, and other educational achievements.',
      icon: GraduationCap,
      category: 'Education',
      color: 'bg-green-500',
      link: '/create-credential/education',
    },
    {
      name: 'Professional License',
      description: 'Create verifiable credentials for professional licenses and certifications.',
      icon: Briefcase,
      category: 'Professional',
      color: 'bg-purple-500',
      link: '/create-credential/professional',
    },
    {
      name: 'Security Clearance',
      description: 'Create credentials for security clearances and background checks.',
      icon: Shield,
      category: 'Security',
      color: 'bg-red-500',
      link: '/create-credential/security',
    },
    {
      name: 'Medical Records',
      description: 'Create verifiable credentials for medical records and health certificates.',
      icon: Heart,
      category: 'Healthcare',
      color: 'bg-pink-500',
      link: '/create-credential/medical',
    },
    {
      name: 'Achievement Badge',
      description: 'Create credentials for awards, recognitions, and achievements.',
      icon: Award,
      category: 'Recognition',
      color: 'bg-yellow-500',
      link: '/create-credential/achievement',
    },
    {
      name: 'Business License',
      description: 'Create verifiable credentials for business licenses and permits.',
      icon: FileText,
      category: 'Business',
      color: 'bg-indigo-500',
      link: '/create-credential/business',
    },
    {
      name: 'Membership Card',
      description: 'Create credentials for organization memberships and affiliations.',
      icon: Users,
      category: 'Membership',
      color: 'bg-teal-500',
      link: '/create-credential/membership',
    }
  ];

  const handleCredentialSelect = (credentialType) => {
    navigate(credentialType.link);
  };

  const groupedCredentials = credentialTypes.reduce((acc, credential) => {
    if (!acc[credential.category]) {
      acc[credential.category] = [];
    }
    acc[credential.category].push(credential);
    return acc;
  }, {});

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
                      onClick={() => handleCredentialSelect(credential)}
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
  );
};

export default ChooseCredentialType;