import { Errors } from './common';
import { ApplicationError } from './models';

/**
 * Создаёт объект ошибки API.
 *
 * @param {Errors} code - Код ошибки.
 * @param {string} message - Внутреннее сообщение.
 *
 * @returns {ApplicationError}
 */
export const createError = (
  code: Errors,
  message: string,
): ApplicationError => ({
  code,
  message,
});
