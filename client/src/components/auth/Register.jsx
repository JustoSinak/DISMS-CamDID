// identity-blockchain-app/client/src/components/auth/Register.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Users } from 'lucide-react';
import Logo from '../../assets/CamDID.png';
import Navbar from '../Navbar';
const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const { register, loading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();
  const [success, setSuccess] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    // Username validation
    // Removed username required validation to make it optional
    // if (!formData.username) {
    //   errors.username = 'Username is required';
    // }

    // First name validation
    if (!formData.firstName) {
      errors.firstName = 'First name is required';
    }

    // Last name validation
    if (!formData.lastName) {
      errors.lastName = 'Last name is required';
    }

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    clearError();

    if (!validateForm()) {
      return;
    }

    const { confirmPassword, ...registrationData } = formData;

    try {
      const result = await register(registrationData);
      if (result && result.success) {
        setSuccess('You successfully register! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else if (result && result.message) {
        setFormErrors({ general: result.message });
      } else {
        setFormErrors({ general: 'Registration failed. Please try again.' });
      }
    } catch (err) {
      setFormErrors({ general: err.message || 'Registration failed. Please try again.' });
    }
  };

  return (
    <div>
      <Navbar />
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img src={Logo} className="h-40 w-auto mx-auto" alt="CamDID Logo" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your CamDID Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Cameroon's digital identity platform
          </p>
        </div>
        
        {success && <div style={{ color: 'green', marginBottom: '1rem' }}>{success}</div>}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {formErrors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {formErrors.general}
            </div>
          )}

          <div className="space-y-4">
            {/* Name */}
            <div className="relative">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <Users className="absolute left-3 top-9 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                id="username"
                name="username"
                type="text"
                className={`mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.username ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
              />
              {formErrors.username && (
                <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
              )}
            </div>

            <div className="relative">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name *
              </label>
              <Users className="absolute left-3 top-9 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className={`mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleChange}
              />
              {formErrors.firstName && (
                <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
              )}
            </div>

            <div className="relative">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name *
              </label>
              <Users className="absolute left-3 top-9 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className={`mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleChange}
              />
              {formErrors.lastName && (
                <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div className='relative'>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <Mail className="absolute left-3 top-9 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className='relative'>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <Lock className="absolute left-3 top-9 w-5 h-5 text-gray-400 pointer-events-none" />
              
              {/* <div className="mt-1 relative"> */}
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={`mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="text-sm text-gray-500">
                    {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                  </span>
                </button>
              {/* </div> */}
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className='relative'>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <Lock className="absolute left-3 top-9 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                className={`mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                  type="button"
                  className="absolute right-3 top-9 flex items-centerconsole.log('Register component rendered');

useEffect(() => {
  console.log('Component mounted');
}, []);

useEffect(() => {
  console.log('isAuthenticated changed:', isAuthenticated);
}, [isAuthenticated]);

useEffect(() => {
  console.log('error changed:', error);
}, [error]);

useEffect(() => {
  console.log('loading changed:', loading);
}, [loading]);

useEffect(() => {
  console.log('success changed:', success);
}, [success]);

useEffect(() => {
  console.log('formErrors changed:', formErrors);
}, [formErrors]);

useEffect(() => {
  console.log('formData changed:', formData);
}, [formData]);

useEffect(() => {
  console.log('showPassword changed:', showPassword);
}, [showPassword]);

const handleChange = (e) => {
  console.log('handleChange called:', e.target.name, e.target.value);
  const { name, value } = e.target;
  setFormData({
    ...formData,
    [name]: value
  });

  // Clear specific field error when user starts typing
  if (formErrors[name]) {
    setFormErrors({
      ...formErrors,
      [name]: ''
    });
  }
};

const validateForm = () => {
  console.log('validateForm called');
  const errors = {};

  // Name validation
  if (!formData.name) {
    errors.name = 'Name is required';
  }

  // Email validation
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Email is invalid';
  }

  // Password validation
  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
    errors.password = 'Password must contain uppercase, lowercase, and number';
  }

  // Confirm password validation
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  setFormErrors(errors);
  console.log('validateForm result:', Object.keys(errors).length === 0);
  return Object.keys(errors).length === 0;
};

const handleSubmit = async (e) => {
  console.log('handleSubmit called');
  e.preventDefault();
  setSuccess('');
  clearError();

  if (!validateForm()) {
    return;
  }

  const { confirmPassword, ...registrationData } = formData;

  try {
    const result = await register(registrationData);
    console.log('register result:', result);
    if (result && result.success) {
      setSuccess('You successfully register! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else if (result && result.message) {
      setFormErrors({ general: result.message });
    } else {
      setFormErrors({ general: 'Registration failed. Please try again.' });
    }
  } catch (err) {
    console.error('handleSubmit error:', err);
    setFormErrors({ general: err.message || 'Registration failed. Please try again.' });
  }
};"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="text-sm text-gray-500">
                    {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                  </span>
                </button>
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Register;