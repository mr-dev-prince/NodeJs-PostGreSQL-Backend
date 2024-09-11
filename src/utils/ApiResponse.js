class ApiResponse {
  constructor(statuscode, data, message, error) {
    this.statuscode = statuscode;
    this.data = data;
    this.message = message;
    this.error = error;
  }

  static success(statuscode, data, message) {
    return new ApiResponse(statuscode, data, message);
  }

  static error(statuscode, error, message) {
    return new ApiResponse(statuscode, message, error);
  }
}

export { ApiResponse };
