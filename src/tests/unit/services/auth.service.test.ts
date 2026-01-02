import { AuthService } from '../../../lib/services/auth.service';
import { UserRepository } from '../../../lib/repositories/user.repository';
import bcrypt from 'bcryptjs';

jest.mock('../../../lib/repositories/user.repository');
jest.mock('bcryptjs');

describe('AuthService', () => {
  let authService: AuthService;
  let userRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    authService = new AuthService();
    userRepo = new UserRepository() as jest.Mocked<UserRepository>;
    (authService as any).userRepo = userRepo;
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      userRepo.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      userRepo.create.mockResolvedValue({
        _id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await authService.register(registerData);

      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('john@example.com');
      expect(result.message).toBe('User registered successfully');
    });

    it('should throw error if user already exists', async () => {
      const registerData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      userRepo.findByEmail.mockResolvedValue({
        _id: '123',
        email: 'john@example.com',
      } as any);

      await expect(authService.register(registerData)).rejects.toThrow(
        'User already exists with this email'
      );
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123',
      };

      userRepo.findByEmail.mockResolvedValue({
        _id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login(loginData);

      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('john@example.com');
      expect(result.message).toBe('Login successful');
    });

    it('should throw error with invalid email', async () => {
      const loginData = {
        email: 'wrong@example.com',
        password: 'password123',
      };

      userRepo.findByEmail.mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should throw error with invalid password', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      userRepo.findByEmail.mockResolvedValue({
        _id: '123',
        password: 'hashedPassword',
      } as any);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginData)).rejects.toThrow(
        'Invalid email or password'
      );
    });
  });
});
