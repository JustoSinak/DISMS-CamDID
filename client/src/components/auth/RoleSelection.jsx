import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Shield, Award } from 'lucide-react';
import Logo from '../../assets/CamDID.png';
import Navbar from '../Navbar';

const RoleSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRegistration = location.pathname === '/register-as';

  const roles = [
    {
      id: 'citizen',
      title: 'Citizen',
      description: 'Register and manage your digital identity, store and share your credentials',
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
      hoverBg: 'hover:bg-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      id: 'verifier',
      title: 'Verifier',
      description: 'Verify and validate digital credentials presented by users',
      icon: Shield,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-500',
      hoverBg: 'hover:bg-green-100',
      borderColor: 'border-green-200'
    },
    {
      id: 'issuer',
      title: 'Issuer',
      description: 'Issue and manage verifiable credentials for users',
      icon: Award,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-500',
      hoverBg: 'hover:bg-purple-100',
      borderColor: 'border-purple-200'
    }
  ];

  const handleRoleSelection = (roleId) => {
    if (isRegistration) {
      navigate(`/register/${roleId}`);
    } else {
      navigate(`/login/${roleId}`);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <img src={Logo} className="h-40 w-auto mx-auto" alt="CamDID Logo" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {isRegistration ? 'Choose Your Role to Register' : 'Choose Your Role to Login'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Select the role that best describes your purpose in the CamDID system
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <div
                key={role.id}
                className={`cursor-pointer transform transition-all duration-300 hover:scale-105 rounded-xl ${role.bgColor} ${role.hoverBg} border ${role.borderColor} p-8 flex flex-col items-center text-center`}
              >
                <div className={`p-4 rounded-full ${role.bgColor} ${role.iconColor}`}>
                  <role.icon size={32} />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">{role.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{role.description}</p>
                <button
                  onClick={() => handleRoleSelection(role.id)}
                  className={`mt-6 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-${role.color}-600 hover:bg-${role.color}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${role.color}-500`}
                >
                  {isRegistration ? 'Register' : 'Login'} as {role.title}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {isRegistration ? "Already have an account? " : "Don't have an account? "}
              <button
                onClick={() => navigate(isRegistration ? '/login-as' : '/register-as')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                {isRegistration ? 'Login here' : 'Register here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection; 