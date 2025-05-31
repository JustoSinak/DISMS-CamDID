import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api';
import axios from 'axios';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('camdid_token'),
  isAuthenticated: false,
  loading: true,
  error: null,
  rememberMe: localStorage.getItem('camdid_remember') === 'true'
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER: 'LOAD_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_REMEMBER_ME: 'SET_REMEMBER_ME'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        loading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      if (state.rememberMe) {
        localStorage.setItem('camdid_token', action.payload.token);
      } else {
        sessionStorage.setItem('camdid_token', action.payload.token);
      }
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      localStorage.removeItem('camdid_token');
      sessionStorage.removeItem('camdid_token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };

    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('camdid_token');
      sessionStorage.removeItem('camdid_token');
      localStorage.removeItem('camdid_remember');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        rememberMe: false
      };

    case AUTH_ACTIONS.LOAD_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false
      };

    case AUTH_ACTIONS.SET_REMEMBER_ME:
      localStorage.setItem('camdid_remember', action.payload);
      return {
        ...state,
        rememberMe: action.payload
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on app start if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const token = state.rememberMe 
        ? localStorage.getItem('camdid_token') 
        : sessionStorage.getItem('camdid_token');

      if (token) {
        try {
          await loadUser();
        } catch (error) {
          console.error('Failed to load user:', error);
          dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: null });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: null });
      }
    };

    initializeAuth();
  }, []);

  // Load user from token
  const loadUser = async () => {
    try {
      const response = await api.get('/auth/profile');
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER,
        payload: response.data.user
      });
    } catch (error) {
      console.error('Load user error:', error);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.response?.data?.message || 'Failed to load user'
      });
      throw error;
    }
  };

  // Register user
  const register = async (registrationData) => {
    try {
      const res = await api.post('/auth/register', registrationData);
      if (res.data.success) {
        return { success: true, message: res.data.message };
      } else {
        return { success: false, message: res.data.message || 'Registration failed' };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  // Login user
  const login = async (loginData, rememberMe = false) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    dispatch({ type: AUTH_ACTIONS.SET_REMEMBER_ME, payload: rememberMe });

    try {
      const res = await api.post('/auth/login', loginData);
      console.log('Login response:', res.data);

      if (res.data.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: res.data.user,
            token: res.data.token
          }
        });

        // Set the token in axios defaults for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

        return { success: true, message: res.data.message };
      } else {
        const errorMessage = res.data.message || 'Login failed';
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: errorMessage
        });
        return { success: false, message: errorMessage };
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || err.message;
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });
      return { success: false, message: errorMessage };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear token from axios defaults
      delete api.defaults.headers.common['Authorization'];
      // Update state
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    register,
    login,
    logout,
    clearError,
    loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


// client/src/context/AuthContext.jsx


