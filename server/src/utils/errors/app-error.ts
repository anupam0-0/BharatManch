// this is a derived call
// first use super -> this


const ERROR_CODES = {
  VALIDATION_ERROR: 400,
  INTERNAL_SERVER_ERROR: 500,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  CONFLICT: 409,
} as const;

type ErrorCode = keyof typeof ERROR_CODES;

export class AppError extends Error {
  statusCode: number;

  constructor(
    public code: ErrorCode,
    message: string,
  ) {
    // calls parent constructor (Error))
    super(message);
    this.statusCode = ERROR_CODES[code];

    // Set the prototype explicitly to maintain the correct prototype chain for instances of AppError. This is necessary because when extending built-in classes like Error, the prototype chain can be broken in some JavaScript environments.
    Object.setPrototypeOf(this, AppError.prototype);

    this.name = this.constructor.name;
    // -> AppError renamed Error

    // v8 optimization
    // removes constructor noise from stack traces
    Error.captureStackTrace(this, this.constructor);
  }
}

// ---
// ---

// export class AppError extends Error {
//   constructor(public statusCode: number, public code: string, message: string) {
//     super(message);
//   }
// }

// export class AppError extends Error {
//   statusCode: number;
//   code: string;
//   constructor(statusCode: number, code: string, message: string) {
//     super(message);
//     this.statusCode = statusCode;
//     this.code = code;
//   }
// }
