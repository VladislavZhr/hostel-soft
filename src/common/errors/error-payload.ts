// src/common/errors/error-payload.ts
export type ErrorMessage = {
  msgId: string;        // бізнес-код (наприклад STUDENT_DUPLICATE)
  errorCode: string;    // HTTP статус у вигляді рядка, напр. "409"
  errorText: string;    // короткий опис для користувача або логів
};

export type ErrorPayload = {
  message: ErrorMessage;
  statusCode: number;   // дублюємо HTTP статус як число
  path: string;
  method: string;
  timestamp: string;
  requestId?: string;
  details?: unknown;    // опційно: масив валідаційних помилок, тех. деталі тощо
};
