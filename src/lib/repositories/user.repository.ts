import User, { IUser } from '../models/User';
import { connectDB } from '../config/database';

export class UserRepository {
  async findById(id: string): Promise<IUser | null> {
    await connectDB();
    return User.findById(id).select('-password');
  }

  async findByEmail(email: string): Promise<IUser | null> {
    await connectDB();
    return User.findOne({ email }).select('+password');
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    await connectDB();
    const user = new User(userData);
    await user.save();
    return user;
  }

  async update(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    await connectDB();
    return User.findByIdAndUpdate(id, userData, { new: true }).select('-password');
  }

  async delete(id: string): Promise<boolean> {
    await connectDB();
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }

  async findAll(page: number = 1, limit: number = 20): Promise<{ users: IUser[]; total: number }> {
    await connectDB();
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find().select('-password').skip(skip).limit(limit),
      User.countDocuments(),
    ]);
    return { users, total };
  }
}