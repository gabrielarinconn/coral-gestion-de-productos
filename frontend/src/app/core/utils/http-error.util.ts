import { HttpErrorResponse } from '@angular/common/http';

export function extractErrorMessage(error: HttpErrorResponse): string {
  const message = error?.error?.message;
  if (Array.isArray(message)) {
    return message.join(' ');
  }
  return message || 'Ocurrió un error inesperado.';
}
