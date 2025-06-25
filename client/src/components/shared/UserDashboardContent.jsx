// import React from 'react';
// import { useAuth } from '../../contexts/AuthContext';
// import { useNavigate, Link } from 'react-router-dom';
// import { 
//   IdentificationIcon,
//   DocumentCheckIcon,
//   BellIcon,
//   PlusIcon,
//   UserPlusIcon,
//   Bars3Icon
// } from '@heroicons/react/24/outline';

// const UserDashboardContent = ({ onMobileMenuOpen }) => {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   const handleCreateIdentity = () => {
//     navigate('/create-credential'); // Redirect to credential type selection
//   };
//   const handleCreateCredential = () => {
//     navigate('/create-credential'); // Redirect to credential type selection
//   };

//   return (
//     <main className="flex-1 overflow-auto">
//       {/* Mobile Header */}
//       <div className="md:hidden bg-white shadow-sm border-b border-gray-200 p-4">
//         <div className="flex items-center justify-between">
//           <button
//             onClick={onMobileMenuOpen}
//             className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md p-2"
//             aria-label="Open menu"
//           >
//             <Bars3Icon className="w-6 h-6" />
//           </button>
//           <h1 className="text-lg font-semibold text-emerald-600">Dashboard</h1>
//           <div className="w-10"></div> {/* Spacer for centering */}
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="p-4 md:p-6">
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-2xl md:text-3xl font-bold text-emerald-600">Citizen Dashboard</h1>
//           <p className="text-slate-600 mt-1 text-sm md:text-base">Manage your digital identity and credentials</p>
//         </div>

//         {/* Quick Actions Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
//           {/* Digital Identity Card */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 hover:border-emerald-500 transition-all duration-200 hover:shadow-md">
//             <div className="flex items-start space-x-4">
//               <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
//                 <IdentificationIcon className="w-6 h-6 text-blue-600" />
//               </div>
//               <div className="flex-1 min-w-0">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-1">Digital Identity</h3>
//                 <p className="text-sm text-gray-500 mb-4">View and manage your digital identity</p>
                
//                 <div className="flex flex-col sm:flex-row gap-2">
//                   <Link
//                     to="/create-credential"
//                     className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
//                   >
//                     <UserPlusIcon className="w-4 h-4 mr-2" />
//                     Create Identity
//                   </Link>
//                   <Link
//                     to="/manage-credentials"  // Updated link for Manage Identity
//                     className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
//                   >
//                     Manage Identity
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Credentials Card */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 hover:border-emerald-500 transition-all duration-200 hover:shadow-md">
//             <div className="flex items-start space-x-4">
//               <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
//                 <DocumentCheckIcon className="w-6 h-6 text-green-600" />
//               </div>
//               <div className="flex-1 min-w-0">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-1">Credentials</h3>
//                 <p className="text-sm text-gray-500 mb-4">View and share your credentials</p>
                
//                 <div className="flex flex-col sm:flex-row gap-2">
//                   <button
//                     onClick={handleCreateCredential}
//                     className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
//                   >
//                     <PlusIcon className="w-4 h-4 mr-2" />
//                     Create Credential
//                   </button>
//                   <Link
//                     to="/credential-wallet"
//                     className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
//                   >
//                     View Credentials
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Verification Requests Card */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 hover:border-emerald-500 transition-all duration-200 hover:shadow-md lg:col-span-2 xl:col-span-1">
//             <div className="flex items-start space-x-4">
//               <div className="bg-purple-100 p-3 rounded-lg flex-shrink-0">
//                 <BellIcon className="w-6 h-6 text-purple-600" />
//               </div>
//               <div className="flex-1 min-w-0">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-1">Verification Requests</h3>
//                 <p className="text-sm text-gray-500 mb-4">Manage verification requests</p>
                
//                 <Link
//                   to="/requests"
//                   className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200 w-full sm:w-auto"
//                 >
//                   View Requests
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Profile Information */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
//           <div className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
//               <div className="text-sm font-medium text-gray-500">Full name</div>
//               <div className="md:col-span-2 text-sm text-gray-900">
//                 {user?.profile?.firstName && user?.profile?.lastName
//                   ? `${user.profile.firstName} ${user.profile.lastName}`
//                   : user?.firstName && user?.lastName
//                   ? `${user.firstName} ${user.lastName}`
//                   : user?.name || 'Not provided'}
//               </div>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
//               <div className="text-sm font-medium text-gray-500">Email address</div>
//               <div className="md:col-span-2 text-sm text-gray-900 break-all">
//                 {user?.email || 'Not provided'}
//               </div>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
//               <div className="text-sm font-medium text-gray-500">Role</div>
//               <div className="md:col-span-2 text-sm text-gray-900">
//                 {user?.role || 'Citizen'}
//               </div>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
//               <div className="text-sm font-medium text-gray-500">Status</div>
//               <div className="md:col-span-2">
//                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                   user?.verified 
//                     ? 'bg-green-100 text-green-800' 
//                     : 'bg-red-100 text-red-800'
//                 }`}>
//                   {user?.verified ? 'Verified' : 'Unverified'}
//                 </span>
//               </div>
//             </div>
//             {user?.did && (
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
//                 <div className="text-sm font-medium text-gray-500">DID</div>
//                 <div className="md:col-span-2 text-sm text-gray-900 font-mono break-all">
//                   {user.did}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Quick Stats */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
//             <div className="text-2xl font-bold text-blue-600">
//               {user?.identities?.length || 0}
//             </div>
//             <div className="text-sm text-gray-500">Identities</div>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
//             <div className="text-2xl font-bold text-green-600">
//               {user?.credentials?.length || 0}
//             </div>
//             <div className="text-sm text-gray-500">Credentials</div>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
//             <div className="text-2xl font-bold text-purple-600">
//               {user?.requests?.length || 0}
//             </div>
//             <div className="text-sm text-gray-500">Requests</div>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
//             <div className="text-2xl font-bold text-emerald-600">
//               {user?.verifications?.length || 0}
//             </div>
//             <div className="text-sm text-gray-500">Verifications</div>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// };

// export default UserDashboardContent;

// ✅ UserDashboardContent.jsx (Modified)
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  IdentificationIcon,
  DocumentCheckIcon,
  BellIcon,
  PlusIcon,
  UserPlusIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

const UserDashboardContent = ({ onMobileMenuOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <main className="flex-1 overflow-auto">
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onMobileMenuOpen}
            type="button"
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md p-2"
            aria-label="Open menu"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-emerald-600">Dashboard</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-emerald-600">Citizen Dashboard</h1>
          <p className="text-slate-600 mt-1 text-sm md:text-base">Manage your digital identity and credentials</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <IdentificationIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Digital Identity</h3>
                <p className="text-sm text-gray-500 mb-4">View and manage your digital identity</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link
                    to="/create-credential"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <UserPlusIcon className="w-4 h-4 mr-2" />
                    Create Identity
                  </Link>
                  <Link
                    to="/manage-credentials"
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Manage Identity
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-start space-x-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <DocumentCheckIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Credentials</h3>
                <p className="text-sm text-gray-500 mb-4">View and share your credentials</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link
                    to="/create-credential"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Credential
                  </Link>
                  <Link
                    to="/credential-wallet"
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    View Credentials
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 lg:col-span-2 xl:col-span-1">
            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <BellIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Verification Requests</h3>
                <p className="text-sm text-gray-500 mb-4">Manage verification requests</p>
                <Link
                  to="/requests"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
                >
                  View Requests
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default UserDashboardContent;
