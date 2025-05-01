/**
 * Authentication Controller Tests
 */
const { describe, it, expect, jest: jestObject } = require('@jest/globals');
const authController = require('../controllers/authController');
const authService = require('../services/authService');
const validators = require('../utils/validators');

// Mock dependencies
jest.mock('../services/authService');
jest.mock('../utils/validators');

describe('Auth Controller', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request, response, and next
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('register', () => {
    it('should return validation errors if validation fails', async () => {
      // Arrange
      const validationErrors = ['Username is required', 'Email is invalid'];
      validators.validateRegistration.mockReturnValue(validationErrors);

      // Act
      await authController.register(req, res);

      // Assert
      expect(validators.validateRegistration).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ errors: validationErrors });
      expect(authService.registerUser).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should register user successfully if validation passes', async () => {
      // Arrange
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      };
      req.body = userData;
      
      validators.validateRegistration.mockReturnValue([]);
      
      const serviceResult = {
        message: 'User created successfully',
        token: 'mock-token',
        user: {
          id: 1,
          username: userData.username,
          email: userData.email,
          role: userData.role
        }
      };
      authService.registerUser.mockResolvedValue(serviceResult);

      // Act
      await authController.register(req, res);

      // Assert
      expect(validators.validateRegistration).toHaveBeenCalledWith(userData);
      expect(authService.registerUser).toHaveBeenCalledWith(userData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(serviceResult);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle UserExistsError correctly', async () => {
      // Arrange
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      req.body = userData;
      
      validators.validateRegistration.mockReturnValue([]);
      
      const error = new Error('Email is already in use');
      error.name = 'UserExistsError';
      authService.registerUser.mockRejectedValue(error);

      // Act
      await authController.register(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should handle ValidationError correctly', async () => {
      // Arrange
      validators.validateRegistration.mockReturnValue([]);
      
      const error = new Error('Invalid data');
      error.name = 'ValidationError';
      authService.registerUser.mockRejectedValue(error);

      // Act
      await authController.register(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors correctly', async () => {
      // Arrange
      validators.validateRegistration.mockReturnValue([]);
      
      const error = new Error('Unexpected error');
      authService.registerUser.mockRejectedValue(error);

      // Act
      await authController.register(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return validation errors if validation fails', async () => {
      // Arrange
      const validationErrors = ['Email is required', 'Password is required'];
      validators.validateLogin.mockReturnValue(validationErrors);

      // Act
      await authController.login(req, res);

      // Assert
      expect(validators.validateLogin).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ errors: validationErrors });
      expect(authService.loginUser).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should login user successfully if validation passes', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      req.body = loginData;
      
      validators.validateLogin.mockReturnValue([]);
      
      const serviceResult = {
        message: 'Login successful',
        token: 'mock-token',
        user: {
          id: 1,
          username: 'testuser',
          email: loginData.email,
          role: 'user'
        }
      };
      authService.loginUser.mockResolvedValue(serviceResult);

      // Act
      await authController.login(req, res);

      // Assert
      expect(validators.validateLogin).toHaveBeenCalledWith(loginData);
      expect(authService.loginUser).toHaveBeenCalledWith(loginData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(serviceResult);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle AuthenticationError correctly', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      req.body = loginData;
      validators.validateLogin.mockReturnValue([]);
      
      const error = new Error('Invalid credentials');
      error.name = 'AuthenticationError';
      authService.loginUser.mockRejectedValue(error);

      // Act
      await authController.login(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors correctly', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      req.body = loginData;
      validators.validateLogin.mockReturnValue([]);
      
      const error = new Error('Unexpected error');
      authService.loginUser.mockRejectedValue(error);

      // Act
      await authController.login(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('verifyToken', () => {
    it('should return valid token response with user data', async () => {
      // Arrange
      req.user = { id: 1, email: 'test@example.com' };

      // Act
      await authController.verifyToken(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({ 
        valid: true,
        user: {
          id: req.user.id,
          email: req.user.email
        }
      });
    });
  });
});
