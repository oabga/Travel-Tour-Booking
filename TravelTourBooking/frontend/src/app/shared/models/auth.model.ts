export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
}

export interface JwtPayload {
  nameid: string;
  email: string;
  role: string;
  exp: number;
}

export interface CustomerProfile {
  fullName: string;
  phone: string | null;
  dateOfBirth: string | null;
  address: string | null;
}

export interface UpdateProfileDto {
  fullName: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
}
