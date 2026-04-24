import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import type { JwtPayload } from '../auth.types';
import { createApiError } from '../../common/api-error';
import { AUTH_ERRORS } from '../auth-errors';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private prisma: PrismaService) {
    const options: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_REFRESH_SECRET as string,
      passReqToCallback: true,
    };
    super(options);
  }

  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.headers.authorization?.split(' ')[1];

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException(
        createApiError('INVALID_REFRESH_TOKEN', AUTH_ERRORS),
      );
    }

    return user;
  }
}
