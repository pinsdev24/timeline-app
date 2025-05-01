/**
 * Authentication Middleware Tests
 */
const { describe, it, expect, jest: jestObject } = require('@jest/globals');
const jwt = require('jsonwebtoken');
const { authenticateToken, checkTokenValidity, authorizeRoles } = require('../middleware/authMiddleware');

// Mock dependencies
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request, response, and next function
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('authenticateToken', () => {
    it('should return 401 if no token is provided', () => {
      // Act
      authenticateToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access denied. No token provided' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
      // Arrange
      req.headers['authorization'] = 'Bearer invalid-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act
      authenticateToken(req, res, next);

      // Assert
      expect(jwt.verify).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() and set req.user if token is valid', () => {
      // Arrange
      const user = { id: 1, email: 'test@example.com' };
      req.headers['authorization'] = 'Bearer valid-token';
      jwt.verify.mockReturnValue(user);

      // Act
      authenticateToken(req, res, next);

      // Assert
      expect(jwt.verify).toHaveBeenCalled();
      expect(req.user).toEqual(user);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('checkTokenValidity', () => {
    it('should return valid: false if no token is provided', () => {
      // Act
      checkTokenValidity(req, res, next);

      // Assert
      expect(res.json).toHaveBeenCalledWith({ valid: false });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return valid: false if token is invalid', () => {
      // Arrange
      req.headers['authorization'] = 'Bearer invalid-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act
      checkTokenValidity(req, res, next);

      // Assert
      expect(jwt.verify).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ valid: false });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() and set req.user if token is valid', () => {
      // Arrange
      const user = { id: 1, email: 'test@example.com' };
      req.headers['authorization'] = 'Bearer valid-token';
      jwt.verify.mockReturnValue(user);

      // Act
      checkTokenValidity(req, res, next);

      // Assert
      expect(jwt.verify).toHaveBeenCalled();
      expect(req.user).toEqual(user);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('authorizeRoles', () => {
    it('should return 401 if user is not authenticated', () => {
      // Act
      const middleware = authorizeRoles(['admin']);
      middleware(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user lacks required role', () => {
      // Arrange
      req.user = { id: 1, email: 'test@example.com', role: 'user' };

      // Act
      const middleware = authorizeRoles(['admin']);
      middleware(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden: Insufficient permissions' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() if user has required role', () => {
      // Arrange
      req.user = { id: 1, email: 'test@example.com', role: 'admin' };

      // Act
      const middleware = authorizeRoles(['admin']);
      middleware(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next() if no roles are specified', () => {
      // Arrange
      req.user = { id: 1, email: 'test@example.com', role: 'user' };

      // Act
      const middleware = authorizeRoles();
      middleware(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
