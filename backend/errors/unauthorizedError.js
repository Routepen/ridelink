function UnauthorizedError(message) {
  this.name = 'UnauthorizedError';
  this.message = message || 'Default Message';
  this.stack = (new Error()).stack;
}
UnauthorizedError.prototype = Object.create(Error.prototype);
UnauthorizedError.prototype.constructor = UnauthorizedError;
