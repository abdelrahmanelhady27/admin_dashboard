import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp?: number;
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    if (!decoded.exp) {
      return false;
    }
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}
