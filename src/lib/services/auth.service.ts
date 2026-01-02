import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';
import { RegisterRequestDTO, LoginRequestDTO } from '../dto/request/auth.dto';
import { AuthResponseDTO, UserResponseDTO } from '../dto/response/auth.dto';
import { IUser } from '../models/User';

export class AuthService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  async register(data: RegisterRequestDTO): Promise<AuthResponseDTO> {
    // Check if user exists
    const existingUser = await this.userRepo.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await this.userRepo.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: 'user',
    });

    return {
      user: this.mapToUserResponse(user),
      message: 'User registered successfully',
    };
  }

  async login(data: LoginRequestDTO): Promise<AuthResponseDTO> {
    // Find user
    const user = await this.userRepo.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    return {
      user: this.mapToUserResponse(user),
      message: 'Login successful',
    };
  }

  async getUserById(id: string): Promise<UserResponseDTO | null> {
    const user = await this.userRepo.findById(id);
    return user ? this.mapToUserResponse(user) : null;
  }

  private mapToUserResponse(user: IUser): UserResponseDTO {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
