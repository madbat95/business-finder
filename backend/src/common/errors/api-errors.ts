export class ApiError extends Error {
  constructor(
    public readonly errorCode: string,
    message: string,
    public readonly statusCode: number,
    public readonly details?: object,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: object) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class GeocodeNotFoundError extends ApiError {
  constructor(message = 'No results found for the given query.', details?: object) {
    super('GEOCODE_NOT_FOUND', message, 404, details);
  }
}

export class UpstreamTimeoutError extends ApiError {
  constructor(message = 'Upstream service timed out.', details?: object) {
    super('UPSTREAM_TIMEOUT', message, 504, details);
  }
}

export class UpstreamRateLimitedError extends ApiError {
  constructor(message = 'Upstream service rate-limited the request.', details?: object) {
    super('UPSTREAM_RATE_LIMITED', message, 429, details);
  }
}

export class UpstreamError extends ApiError {
  constructor(message = 'Upstream service request failed.', details?: object) {
    super('UPSTREAM_ERROR', message, 502, details);
  }
}
