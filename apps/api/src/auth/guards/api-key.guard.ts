import {
  Injectable,
  UnauthorizedException,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiKeyService, MerchantApiPrincipal } from '../api-key.service';
import { createApiError } from '../../common/api-error';
import { AUTH_ERRORS } from '../auth-errors';

type ApiKeyRequest = Request & { merchantApi?: MerchantApiPrincipal };

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Extract the API key from the request header
    const request = context.switchToHttp().getRequest<ApiKeyRequest>();
    const rawKey = request.header('x-api-key');

    // If no API key is provided, deny access
    if (!rawKey) {
      throw new UnauthorizedException(
        createApiError('INVALID_API_KEY', AUTH_ERRORS),
      );
    }
    request.merchantApi = await this.apiKeyService.validateApiKey(rawKey);
    return true;
  }
}
