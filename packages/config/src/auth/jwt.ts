// packages/config/src/auth/jwt.ts
export const JWT_CONFIG = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET || 'access-secret',
    expiresIn: '15m',
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
    expiresIn: '7d',
  },
};