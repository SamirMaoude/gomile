import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { MerchantApiPrincipal } from '../api-key.service';

export const CurrentMerchantApi = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): MerchantApiPrincipal => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ merchantApi: MerchantApiPrincipal }>();
    return request.merchantApi;
  },
);
