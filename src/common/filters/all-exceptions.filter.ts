import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { AppException } from '../errors/app.exception';
import type { ErrorPayload } from '../errors/error-payload';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const requestId = (req as any).id || (req.headers['x-request-id'] as string) || randomUUID();
    const timestamp = new Date().toISOString();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let payload: ErrorPayload;

    if (exception instanceof AppException) {
      status = exception.getStatus();
      payload = exception.toPayload({
        path: req.url,
        method: req.method,
        timestamp,
        requestId,
      });
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resp = exception.getResponse();
      const errorText =
        typeof resp === 'string'
          ? resp
          : (resp as any)?.message ?? exception.message ?? 'Unhandled HttpException';

      payload = {
        message: {
          msgId: 'HTTP_EXCEPTION',
          errorCode: String(status),
          errorText: Array.isArray(errorText) ? errorText.join('; ') : String(errorText),
        },
        statusCode: status,
        path: req.url,
        method: req.method,
        timestamp,
        requestId,
        details: typeof resp === 'object' ? resp : undefined,
      };
    } else {
      const err = exception as Error;
      payload = {
        message: {
          msgId: 'INTERNAL_ERROR',
          errorCode: String(HttpStatus.INTERNAL_SERVER_ERROR),
          errorText: err?.message || 'Внутрішня помилка сервера',
        },
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        path: req.url,
        method: req.method,
        timestamp,
        requestId,
        details: process.env.NODE_ENV !== 'production' ? { stack: err?.stack } : undefined,
      };
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    this.logger.error(
      { requestId, path: req.url, method: req.method, status, exception },
      `Handled exception: ${payload.message.msgId}`,
    );

    res.status(status).json(payload);
  }
}
