export interface LoginRequest {
  email: string,
  password: string
}

export interface RegisterRequest {
  fullName: string,
  email: string,
  password: string
}

export interface RegisterResponse {
  fullName: string,
  email: string,
  role: string
}

export interface AuthResponse {
  fullName: string,
  email: string,
  token: string,
  refreshToken: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}
