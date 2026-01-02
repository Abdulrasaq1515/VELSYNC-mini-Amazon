export interface AuthResponseDTO {
  user: UserResponseDTO;
  token?: string;
  message: string;
}


export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
}
