import jwt from 'jsonwebtoken';

export class JWTService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor(secret: string, expiresIn: string = '24h') {
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  generateToken(payload: any): AuthToken {
    const token = jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    
    return {
      token,
      expiresAt: new Date((decoded.exp || 0) * 1000),
    };
  }

  verifyToken(token: string): any {
    return jwt.verify(token, this.secret);
  }
}