// server/tests/setup.js - Test setup and utilities for DISMS
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Credential = require('../models/Credential');

class TestSetup {
  constructor() {
    this.mongoServer = null;
    this.testUsers = {};
    this.testCredentials = {};
  }

  // Setup test database
  async setupDatabase() {
    try {
      // Start in-memory MongoDB instance
      this.mongoServer = await MongoMemoryServer.create();
      const mongoUri = this.mongoServer.getUri();

      // Connect to the in-memory database
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      console.log('Test database connected');
      return true;
    } catch (error) {
      console.error('Test database setup failed:', error);
      return false;
    }
  }

  // Cleanup test database
  async cleanupDatabase() {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
      }

      if (this.mongoServer) {
        await this.mongoServer.stop();
      }

      console.log('Test database cleaned up');
      return true;
    } catch (error) {
      console.error('Test database cleanup failed:', error);
      return false;
    }
  }

  // Create test users
  async createTestUsers() {
    try {
      const hashedPassword = await bcrypt.hash('testpassword123', 12);

      // Create citizen user
      const citizen = new User({
        email: 'citizen@test.com',
        password: hashedPassword,
        role: 'citizen',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-01-01'),
          address: {
            street: '123 Test Street',
            city: 'Test City',
            state: 'Test State',
            postalCode: '12345',
            country: 'Cameroon'
          }
        },
        verification: {
          emailVerified: true,
          phoneVerified: true,
          identityVerified: true,
          verificationLevel: 3
        }
      });

      // Create issuer user
      const issuer = new User({
        email: 'issuer@test.com',
        password: hashedPassword,
        role: 'issuer',
        profile: {
          firstName: 'Jane',
          lastName: 'Smith',
          organizationName: 'Test Issuer Organization'
        },
        verification: {
          emailVerified: true,
          phoneVerified: true,
          identityVerified: true,
          verificationLevel: 5
        }
      });

      // Create verifier user
      const verifier = new User({
        email: 'verifier@test.com',
        password: hashedPassword,
        role: 'verifier',
        profile: {
          firstName: 'Bob',
          lastName: 'Johnson',
          organizationName: 'Test Verifier Organization'
        },
        verification: {
          emailVerified: true,
          phoneVerified: true,
          identityVerified: true,
          verificationLevel: 4
        }
      });

      // Save users
      await citizen.save();
      await issuer.save();
      await verifier.save();

      // Store references
      this.testUsers = {
        citizen,
        issuer,
        verifier
      };

      console.log('Test users created');
      return this.testUsers;
    } catch (error) {
      console.error('Error creating test users:', error);
      throw error;
    }
  }

  // Create test credentials
  async createTestCredentials() {
    try {
      if (!this.testUsers.citizen || !this.testUsers.issuer) {
        throw new Error('Test users must be created first');
      }

      // Create identity credential
      const identityCredential = new Credential({
        userId: this.testUsers.citizen._id,
        issuerId: this.testUsers.issuer._id,
        type: 'identity',
        status: 'verified',
        data: {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
          nationalId: 'CM123456789',
          placeOfBirth: 'Yaoundé, Cameroon'
        },
        metadata: {
          title: 'National Identity Card',
          description: 'Official Cameroon National Identity Card',
          issuer: 'Ministry of Territorial Administration',
          issuedAt: new Date(),
          expirationDate: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000) // 10 years
        },
        blockchain: {
          transactionHash: '0x1234567890abcdef',
          blockNumber: 12345,
          merkleRoot: 'merkle_root_hash_123'
        }
      });

      // Create education credential
      const educationCredential = new Credential({
        userId: this.testUsers.citizen._id,
        issuerId: this.testUsers.issuer._id,
        type: 'education',
        status: 'verified',
        data: {
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          institution: 'University of Yaoundé I',
          graduationDate: '2015-06-15',
          gpa: '3.8'
        },
        metadata: {
          title: 'Bachelor\'s Degree Certificate',
          description: 'Bachelor of Science in Computer Science',
          issuer: 'University of Yaoundé I',
          issuedAt: new Date('2015-06-15'),
          expirationDate: null // No expiration
        }
      });

      // Save credentials
      await identityCredential.save();
      await educationCredential.save();

      // Store references
      this.testCredentials = {
        identity: identityCredential,
        education: educationCredential
      };

      console.log('Test credentials created');
      return this.testCredentials;
    } catch (error) {
      console.error('Error creating test credentials:', error);
      throw error;
    }
  }

  // Generate JWT token for testing
  generateTestToken(user) {
    return jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'test_jwt_secret',
      { expiresIn: '1h' }
    );
  }

  // Get authorization header for testing
  getAuthHeader(user) {
    const token = this.generateTestToken(user);
    return { Authorization: `Bearer ${token}` };
  }

  // Clear all test data
  async clearTestData() {
    try {
      await User.deleteMany({});
      await Credential.deleteMany({});
      
      this.testUsers = {};
      this.testCredentials = {};
      
      console.log('Test data cleared');
      return true;
    } catch (error) {
      console.error('Error clearing test data:', error);
      return false;
    }
  }

  // Setup complete test environment
  async setupTestEnvironment() {
    try {
      await this.setupDatabase();
      await this.createTestUsers();
      await this.createTestCredentials();
      
      console.log('Test environment setup complete');
      return {
        users: this.testUsers,
        credentials: this.testCredentials
      };
    } catch (error) {
      console.error('Test environment setup failed:', error);
      await this.cleanupDatabase();
      throw error;
    }
  }

  // Cleanup complete test environment
  async cleanupTestEnvironment() {
    try {
      await this.clearTestData();
      await this.cleanupDatabase();
      
      console.log('Test environment cleanup complete');
      return true;
    } catch (error) {
      console.error('Test environment cleanup failed:', error);
      return false;
    }
  }

  // Mock external services
  mockExternalServices() {
    // Mock blockchain service
    const mockBlockchain = {
      storeCredential: jest.fn().mockResolvedValue({
        transactionHash: '0xmockhash',
        blockNumber: 12345
      }),
      verifyCredential: jest.fn().mockResolvedValue(true),
      revokeCredential: jest.fn().mockResolvedValue(true)
    };

    // Mock IPFS service
    const mockIPFS = {
      store: jest.fn().mockResolvedValue('QmMockHash'),
      retrieve: jest.fn().mockResolvedValue({ data: 'mock data' })
    };

    // Mock email service
    const mockEmail = {
      sendVerificationEmail: jest.fn().mockResolvedValue(true),
      sendNotification: jest.fn().mockResolvedValue(true)
    };

    return {
      blockchain: mockBlockchain,
      ipfs: mockIPFS,
      email: mockEmail
    };
  }

  // Create test request object
  createMockRequest(options = {}) {
    return {
      body: options.body || {},
      params: options.params || {},
      query: options.query || {},
      headers: options.headers || {},
      user: options.user || null,
      ip: options.ip || '127.0.0.1',
      get: jest.fn((header) => options.headers[header])
    };
  }

  // Create test response object
  createMockResponse() {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis()
    };
    return res;
  }

  // Assertion helpers
  expectSuccessResponse(response, expectedData = null) {
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        ...(expectedData && { data: expect.objectContaining(expectedData) })
      })
    );
  }

  expectErrorResponse(response, statusCode, expectedMessage = null) {
    expect(response.status).toHaveBeenCalledWith(statusCode);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        ...(expectedMessage && { message: expectedMessage })
      })
    );
  }
}

// Export singleton instance
const testSetup = new TestSetup();

module.exports = {
  testSetup,
  TestSetup
};
