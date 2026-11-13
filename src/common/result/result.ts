import { AppError } from '../errors/app-error.js';

/**
 * Result pattern for functional error handling without untyped throws.
 * Adheres to The Trinity OS Clean Architecture standard (Section 7.1).
 */
export class Result<T, E = AppError> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: E,
  ) {}

  public static ok<U, F = AppError>(value: U): Result<U, F> {
    return new Result<U, F>(true, value, undefined);
  }

  public static fail<U, F = AppError>(error: F): Result<U, F> {
    return new Result<U, F>(false, undefined, error);
  }

  public get isSuccess(): boolean {
    return this._isSuccess;
  }

  public get isFailure(): boolean {
    return !this._isSuccess;
  }

  public get value(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot retrieve value from a failed Result.');
    }
    return this._value as T;
  }

  public get error(): E {
    if (this._isSuccess) {
      throw new Error('Cannot retrieve error from a successful Result.');
    }
    return this._error as E;
  }
}
