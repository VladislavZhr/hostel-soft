// src/common/errors/app.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';
import type { ErrorPayload } from './error-payload';

export class AppException extends HttpException {
  public readonly msgId: string;
  public readonly errorText: string;
  public readonly details?: unknown;

  constructor(
    msgId: string,
    errorText: string,
    status: HttpStatus,
    details?: unknown,
  ) {
    super(errorText, status);
    this.msgId = msgId;
    this.errorText = errorText;
    this.details = details;
  }

  toPayload(meta: { path: string; method: string; timestamp: string; requestId?: string; }): ErrorPayload {
    return {
      message: {
        msgId: this.msgId,
        errorCode: String(this.getStatus()),
        errorText: this.errorText,
      },
      statusCode: this.getStatus(),
      path: meta.path,
      method: meta.method,
      timestamp: meta.timestamp,
      requestId: meta.requestId,
      details: this.details,
    };
  }
}
