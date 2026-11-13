import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const requestId =
      (req.headers['x-request-id'] as string) || `req-${randomUUID()}`;

    // Attach to request and response header
    (req as unknown as { requestId: string }).requestId = requestId;
    res.setHeader('x-request-id', requestId);

    const start = performance.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Math.round(performance.now() - start);
        res.setHeader('x-response-time', `${duration}ms`);
      }),
    );
  }
}
