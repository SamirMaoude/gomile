import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createApiError } from '../../common/api-error';
import { AUTH_ERRORS } from '../auth-errors';
import type { AuthenticatedUser } from '../auth.types';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: AuthenticatedUser | null;
    }>();
    const user = request.user;

    // API key-authenticated requests do not carry a JWT user object here.
    // Those flows are intentionally left to their existing authorization rules.
    if (!user?.id) {
      return true;
    }

    const currentUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { emailVerified: true },
    });

    if (!currentUser?.emailVerified) {
      throw new ForbiddenException(
        createApiError('EMAIL_NOT_VERIFIED', AUTH_ERRORS),
      );
    }

    return true;
  }
}
