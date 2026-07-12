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

export function getRolesFromToken(token: string): string[] {
  try {
    const decoded = jwtDecode<any>(token);
    const roleClaim = decoded['role'] || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    if (!roleClaim) {
      return [];
    }
    return Array.isArray(roleClaim) ? roleClaim : [roleClaim];
  } catch {
    return [];
  }
}

