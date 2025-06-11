
export type UserRole = 'TEACHER' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  role: UserRole;
  cel_phone?: string | null;
  registration_date?: string;
  // Fields that might be more student-specific but can be optional on User
  emotion?: string | null;
  coin_earned?: number;
  coin_available?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends Omit<User, 'id' | 'registration_date' | 'emotion' | 'coin_earned' | 'coin_available'> {
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}
