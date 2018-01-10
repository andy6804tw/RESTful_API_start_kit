import httpStatus from 'http-status';

/**
 * @extends Error
 */
class ExtendableError extends Error {
  constructor(message, status, isPublic, code) {
    super(message);
    this.message = message;
    this.name = this.constructor.name;
    this.status = status;
    this.isPublic = isPublic;
    this.code = code;
    this.isOperational = true; // This is required since bluebird 4 doesn't append it anymore.
    Error.captureStackTrace(this, this.constructor.name);
  }
}

/**
 * Class representing an API error.
 * @extends ExtendableError
 */
class APIError extends ExtendableError {
  /**
   * Creates an API error.
   * @param {string} message - Error message.
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor(message, status = httpStatus.INTERNAL_SERVER_ERROR, isPublic = false, code) {
    super(message, status, isPublic, code);
    this.name = 'APIError';
  }
}

/**
 * Class representing an MySQL error.
 * @extends ExtendableError
 */
class MySQLError extends ExtendableError {
  /**
   * Creates an API error.
   * @param {string} message - Error message.
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor(message = 'Backend Error', status = httpStatus.INTERNAL_SERVER_ERROR, isPublic = true, code = 500) {
    super(message, status, isPublic, code);
    this.name = 'MySQLError';
  }
}

/**
 * 信箱尚未註冊 Error
 * @extends ExtendableError
 */
class LoginError1 extends ExtendableError {
  /**
   * Creates an API error.
   * @param {string} message - Error message.
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor(message = '信箱尚未註冊！', status = httpStatus.UNAUTHORIZED, isPublic = true, code = 401) {
    super(message, status, isPublic, code);
    this.name = 'LoginError';
  }
}
/**
 * 密碼錯誤 Error.
 * @extends ExtendableError
 */
class LoginError2 extends ExtendableError {
  /**
   * Creates an API error.
   * @param {string} message - Error message.
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor(message = '您輸入的密碼有誤！', status = httpStatus.UNAUTHORIZED, isPublic = true, code = 401) {
    super(message, status, isPublic, code);
    this.name = 'LoginError';
  }
}


export default {
  APIError,
  MySQLError,
  LoginError1,
  LoginError2
};
