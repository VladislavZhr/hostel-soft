// src/common/errors/exceptions.ts
import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class DuplicateStudentException extends AppException {
  constructor(details?: unknown) {
    super('STUDENT_DUPLICATE', 'Студента вже додано', HttpStatus.CONFLICT, details);
  }
}

export class EntityNotFoundException extends AppException {
  constructor(entity: string, details?: unknown) {
    super(`${entity.toUpperCase()}_NOT_FOUND`, `${entity} не знайдено`, HttpStatus.NOT_FOUND, details);
  }
}

export class AuthFailedException extends AppException {
  constructor(details?: unknown) {
    super('AUTH_FAILED', 'Невірний логін або пароль', HttpStatus.UNAUTHORIZED, details);
  }
}

export class EmptyPATCHRequest extends AppException {
  constructor(details?: unknown) {
    super('PATCH_FAILED', 'Немає жодної зміни (порожній PATCH).', HttpStatus.CONFLICT, details);
  }
}

export class DuplicateStudentValue extends AppException {
  constructor(details?: unknown) {
    super('PATCH_FAILED', 'Значення полів вже встановлені — оновлення не потрібне.', HttpStatus.CONFLICT, details);
  }
}

// окремо — для валідації DTO
export class ValidationException extends AppException {
  constructor(details: Array<{ field: string; errors: string[] }>) {
    super('VALIDATION_ERROR', 'Невірні дані запиту', HttpStatus.BAD_REQUEST, details);
  }
}
