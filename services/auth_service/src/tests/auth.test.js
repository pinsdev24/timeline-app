/**
 * Authentication Service Tests
 */
const { describe, it, expect, beforeEach, afterEach, jest: jestObject } = require('@jest/globals');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authService = require('../services/authService');
const User = require('../models/User');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('bcrypt');
jest.mock('../models/User');

describe('Auth Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      };
      
      const hashedPassword = 'hashedpassword123';
      const mockUser = {
        id: 1,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        password: hashedPassword
      };
      
      // Mock implementations
      User.findOne.mockResolvedValue(null); // User doesn't exist
      bcrypt.hash.mockResolvedValue(hashedPassword);
      User.create.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mock-token');
      
      // Act
      const result = await authService.registerUser(userData);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: userData.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(User.create).toHaveBeenCalledWith({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role
      });
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'User created successfully',
        token: 'mock-token',
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          role: mockUser.role
        }
      });
    });

    it('should throw UserExistsError if email is already in use', async () => {
      // Arrange
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      // Mock implementation
      User.findOne.mockResolvedValue({ id: 1, email: userData.email }); // User exists
      
      // Act & Assert
      await expect(authService.registerUser(userData)).rejects.toThrow(authService.UserExistsError);
    });
  });

  describe('loginUser', () => {
    it('should login user successfully with valid credentials', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: loginData.email,
        password: 'hashedpassword123',
        role: 'user'
      };
      
      // Mock implementations
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true); // Password matches
      jwt.sign.mockReturnValue('mock-token');
      
      // Act
      const result = await authService.loginUser(loginData);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: loginData.email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Login successful',
        token: 'mock-token',
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          role: mockUser.role
        }
      });
    });
    
    it('should throw AuthenticationError if user not found', async () => {
      // Arrange
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      // Mock implementation
      User.findOne.mockResolvedValue(null); // User not found
      
      // Act & Assert
      await expect(authService.loginUser(loginData)).rejects.toThrow(authService.AuthenticationError);
    });
    
    it('should throw AuthenticationError if password is incorrect', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      
      const mockUser = {
        id: 1,
        email: loginData.email,
        password: 'hashedpassword123'
      };
      
      // Mock implementations
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false); // Password doesn't match
      
      // Act & Assert
      await expect(authService.loginUser(loginData)).rejects.toThrow(authService.AuthenticationError);
    });
  });

  describe('verifyToken', () => {
    it('should return decoded user data for valid token', () => {
      // Arrange
      const token = 'valid-token';
      const decodedToken = { id: 1, email: 'test@example.com' };
      
      // Mock implementation
      jwt.verify.mockReturnValue(decodedToken);
      
      // Act
      const result = authService.verifyToken(token);
      
      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(result).toEqual(decodedToken);
    });
    
    it('should return null for invalid token', () => {
      // Arrange
      const token = 'invalid-token';
      
      // Mock implementation
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      // Act
      const result = authService.verifyToken(token);
      
      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(result).toBeNull();
    });
  });
});
