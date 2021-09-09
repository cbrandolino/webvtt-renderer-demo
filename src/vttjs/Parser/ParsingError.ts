// Creates a new ParserError object from an errorData object. The errorData
// object should have default code and message properties. The default message
// property can be overriden by passing in a message parameter.


interface IParsingError {
  name: string,
  code?: number,
  message?: string,
}

// See ParsingError.Errors below for acceptable errors.
class ParsingError extends Error implements IParsingError {
  name = 'ParsingError';
  code;
  message = '';

  constructor(errorData:{ code: number, message?: string}, message: string) {
    super(message || errorData.message);
    this.code = errorData.code
  }

  static Errors = {
    BadSignature: {
      code: 0,
      message: "Malformed WebVTT signature."
    },
    BadTimeStamp: {
      code: 1,
      message: "Malformed time stamp."
    }
  }
};

export default ParsingError;
