// server/tests/auth.test.js - Authentication controller tests
const { testSetup } = require('./setup');
const authController = require('../controllers/authController');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

describe('Authentication Controller', () => {
  beforeAll(async () => {
    await testSetup.setupDatabase();
  });

  afterAll(async () => {
    await testSetup.cleanupDatabase();
  });

  beforeEach(async () => {
    await testSetup.clearTestData();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const req = testSetup.createMockRequest({
        body: {
          email: 'newuser@test.com',
          password: 'password123',
          confirmPassword: 'password123',
          role: 'citizen',
          firstName: 'New',
          lastName: 'User'
        }
      });
      const res = testSetup.createMockResponse();

      await authController.register(req, res);

      testSetup.expectSuccessResponse(res, {
        user: expect.objectContaining({
          email: 'newuser@test.com',
          role: 'citizen'
        })
      });

      // Verify user was created in database
      const user = await User.findOne({ email: 'newuser@test.com' });
      expect(user).toBeTruthy();
      expect(user.profile.firstName).toBe('New');
      expect(user.profile.lastName).toBe('User');
    });

    it('should fail with invalid email format', async () => {
      const req = testSetup.createMockRequest({
        body: {
          email: 'invalid-email',
          password: 'password123',
          confirmPassword: 'password123',
          role: 'citizen'
        }
      });
      const res = testSetup.createMockResponse();

      await authController.register(req, res);

      testSetup.expectErrorResponse(res, 400);
    });

    it('should fail when passwords do not match', async () => {
      const req = testSetup.createMockRequest({
        body: {
          email: 'test@test.com',
          password: 'password123',
          confirmPassword: 'differentpassword',
          role: 'citizen'
        }
      });
      const res = testSetup.createMockResponse();

      await authController.register(req, res);

      testSetup.expectErrorResponse(res, 400, 'Passwords do not match');
    });

    it('should fail when user already exists', async () => {
      // Create existing user
      const existingUser = new User({
        email: 'existing@test.com',
        password: await bcrypt.hash('password123', 12),
        role: 'citizen',
        profile: { firstName: 'Existing', lastName: 'User' }
      });
      await existingUser.save();

      const req = testSetup.createMockRequest({
        body: {
          email: 'existing@test.com',
          password: 'password123',
          confirmPassword: 'password123',
          role: 'citizen'
        }
      });
      const res = testSetup.createMockResponse();

      await authController.register(req, res);

      testSetup.expectErrorResponse(res, 400, 'User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user for login tests
      const hashedPassword = await bcrypt.hash('password123', 12);
      const testUser = new User({
        email: 'logintest@test.com',
        password: hashedPassword,
        role: 'citizen',
        profile: { firstName: 'Login', lastName: 'Test' },
        verification: { emailVerified: true }
      });
      await testUser.save();
    });

    it('should login successfully with valid credentials', async () => {
      const req = testSetup.createMockRequest({
        body: {
          email: 'logintest@test.com',
          password: 'password123'
        }
      });
      const res = testSetup.createMockResponse();

      await authController.login(req, res);

      testSetup.expectSuccessResponse(res, {
        user: expect.objectContaining({
          email: 'logintest@test.com'
        }),
        token: expect.any(String)
      });
    });

    it('should fail with invalid email', async () => {
      const req = testSetup.createMockRequest({
        body: {
          email: 'nonexistent@test.com',
          password: 'password123'
        }
      });
      const res = testSetup.createMockResponse();

      await authController.login(req, res);

      testSetup.expectErrorResponse(res, 401, 'Invalid credentials');
    });

    it('should fail with invalid password', async () => {
      const req = testSetup.createMockRequest({
        body: {
          email: 'logintest@test.com',
          password: 'wrongpassword'
        }
      });
      const res = testSetup.createMockResponse();

      await authController.login(req, res);

      testSetup.expectErrorResponse(res, 401, 'Invalid credentials');
    });

    it('should fail with unverified email', async () => {
      // Create unverified user
      const hashedPassword = await bcrypt.hash('password123', 12);
      const unverifiedUser = new User({
        email: 'unverified@test.com',
        password: hashedPassword,
        role: 'citizen',
        profile: { firstName: 'Unverified', lastName: 'User' },
        verification: { emailVerified: false }
      });
      await unverifiedUser.save();

      const req = testSetup.createMockRequest({
        body: {
          email: 'unverified@test.com',
          password: 'password123'
        }
      });
      const res = testSetup.createMockResponse();

      await authController.login(req, res);

      testSetup.expectErrorResponse(res, 401, 'Please verify your email before logging in');
    });
  });

  describe('GET /api/auth/me', () => {
    let testUser;

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);
      testUser = new User({
        email: 'metest@test.com',
        password: hashedPassword,
        role: 'citizen',
        profile: { firstName: 'Me', lastName: 'Test' },
        verification: { emailVerified: true }
      });
      await testUser.save();
    });

    it('should return user data for authenticated user', async () => {
      const req = testSetup.createMockRequest({
        user: { id: testUser._id, email: testUser.email, role: testUser.role }
      });
      const res = testSetup.createMockResponse();

      await authController.getMe(req, res);

      testSetup.expectSuccessResponse(res, {
        user: expect.objectContaining({
          email: 'metest@test.com',
          role: 'citizen'
        })
      });
    });

    it('should fail for non-existent user', async () => {
      const req = testSetup.createMockRequest({
        user: { id: '507f1f77bcf86cd799439011', email: 'fake@test.com', role: 'citizen' }
      });
      const res = testSetup.createMockResponse();

      await authController.getMe(req, res);

      testSetup.expectErrorResponse(res, 404, 'User not found');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const req = testSetup.createMockRequest();
      const res = testSetup.createMockResponse();

      await authController.logout(req, res);

      testSetup.expectSuccessResponse(res);
      expect(res.clearCookie).toHaveBeenCalledWith('token');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);
      const testUser = new User({
        email: 'forgot@test.com',
        password: hashedPassword,
        role: 'citizen',
        profile: { firstName: 'Forgot', lastName: 'Password' },
        verification: { emailVerified: true }
      });
      await testUser.save();
    });

    it('should send reset email for valid user', async () => {
      const req = testSetup.createMockRequest({
        body: { email: 'forgot@test.com' }
      });
      const res = testSetup.createMockResponse();

      await authController.forgotPassword(req, res);

      testSetup.expectSuccessResponse(res);
      
      // Verify reset token was set
      const user = await User.findOne({ email: 'forgot@test.com' });
      expect(user.resetPasswordToken).toBeTruthy();
      expect(user.resetPasswordExpires).toBeTruthy();
    });

    it('should not reveal if user does not exist', async () => {
      const req = testSetup.createMockRequest({
        body: { email: 'nonexistent@test.com' }
      });
      const res = testSetup.createMockResponse();

      await authController.forgotPassword(req, res);

      // Should still return success to not reveal user existence
      testSetup.expectSuccessResponse(res);
    });
  });

  describe('POST /api/auth/change-password', () => {
    let testUser;

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('oldpassword123', 12);
      testUser = new User({
        email: 'changepass@test.com',
        password: hashedPassword,
        role: 'citizen',
        profile: { firstName: 'Change', lastName: 'Password' },
        verification: { emailVerified: true }
      });
      await testUser.save();
    });

    it('should change password successfully', async () => {
      const req = testSetup.createMockRequest({
        user: { id: testUser._id, email: testUser.email, role: testUser.role },
        body: {
          currentPassword: 'oldpassword123',
          newPassword: 'newpassword123'
        }
      });
      const res = testSetup.createMockResponse();

      await authController.changePassword(req, res);

      testSetup.expectSuccessResponse(res);

      // Verify password was changed
      const updatedUser = await User.findById(testUser._id).select('+password');
      const isNewPasswordValid = await bcrypt.compare('newpassword123', updatedUser.password);
      expect(isNewPasswordValid).toBe(true);
    });

    it('should fail with incorrect current password', async () => {
      const req = testSetup.createMockRequest({
        user: { id: testUser._id, email: testUser.email, role: testUser.role },
        body: {
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123'
        }
      });
      const res = testSetup.createMockResponse();

      await authController.changePassword(req, res);

      testSetup.expectErrorResponse(res, 400, 'Current password is incorrect');
    });
  });
});
