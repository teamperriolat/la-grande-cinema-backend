import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
export interface JwtPayload {
  sub: string;
  email: string;
  role: 'USER' | 'ADMIN';
}
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET ?? 'development-only-change-me',
    });
  }
  validate(payload: JwtPayload) {
    return payload;
  }
}
