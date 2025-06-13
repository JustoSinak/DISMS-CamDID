// services/apiService.js
class ApiService {
    constructor() {
      this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    }
  
    // Get auth headers
    getAuthHeaders() {
      const token = localStorage.getItem('authToken');
      return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };
    }
  
    // Generic API call
    async apiCall(endpoint, options = {}) {
      try {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
          headers: this.getAuthHeaders(),
          ...options
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.message || 'API request failed');
        }
  
        return data;
      } catch (error) {
        console.error('API call error:', error);
        throw error;
      }
    }
  
    // Identity API methods
    async createIdentity(identityData) {
      return this.apiCall('/identity/create', {
        method: 'POST',
        body: JSON.stringify(identityData)
      });
    }
  
    async getIdentity() {
      return this.apiCall('/identity');
    }
  
    async updateBlockchainStatus(statusData) {
      return this.apiCall('/identity/blockchain-status', {
        method: 'PUT',
        body: JSON.stringify(statusData)
      });
    }
  
    async addAttribute(attributeData) {
      return this.apiCall('/identity/attributes', {
        method: 'POST',
        body: JSON.stringify(attributeData)
      });
    }
  
    // User API methods
    async registerUser(userData) {
      return this.apiCall('/users/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    }
  
    async loginUser(credentials) {
      return this.apiCall('/users/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
    }
  
    async getUserProfile() {
      return this.apiCall('/users/profile');
    }
  
    // Credential API methods
    async getCredentials() {
      return this.apiCall('/credentials');
    }
  
    async verifyCredential(credentialHash) {
      return this.apiCall(`/credentials/verify/${credentialHash}`);
    }
  }
  
  export default new ApiService();
  