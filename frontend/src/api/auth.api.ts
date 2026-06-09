import { api } from './axiosClient';
import type { AuthResponse, LoginDto, RegisterDto } from '../types/auth.types';

interface ApiEnvelope<T> {
  data: T;
  message?: string;
}

export async function login(dto: LoginDto): Promise<AuthResponse> {
  const res = await api.post<ApiEnvelope<AuthResponse>>('/auth/login', dto);
  return res.data.data;
}

export async function register(dto: RegisterDto): Promise<AuthResponse> {
  const res = await api.post<ApiEnvelope<AuthResponse>>('/auth/register', dto);
  return res.data.data;
}
