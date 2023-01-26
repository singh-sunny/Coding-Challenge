class ValidationError extends Error {
    constructor(message: string) {
      super(message);
    }
  }
  
  export { ValidationError }