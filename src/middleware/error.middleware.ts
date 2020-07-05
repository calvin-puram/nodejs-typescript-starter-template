import { NextFunction, Request, Response } from "express";
import HttpException from "../exceptions/HttpException";

//send error in development
const sendErrorDev = (error: HttpException, res: Response): object => {
  return res.status(error.statusCode).json({
    success: false,
    msg: error.message,
    stack: error.stack,
  });
};

// send error in production
const sendErrorProd = (error: HttpException, res: Response): object => {
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      success: false,
      msg: error.message,
    });
  } else {
    //something unexpected happens
    console.log(error);
    return res.status(500).json({
      success: false,
      msg: "something unexpected occur. please try again later",
    });
  }
};

// handle cast error
const handleCastError = (error: any): object => {
  const message = `this ${error.path}: ${error.value} is not valid`;
  return new HttpException(400, message);
};

// handle duplicate error
const handleDuplicateError = (): object => {
  const message: string = `duplicate field entry `;
  return new HttpException(400, message);
};

// handle validation error
const handleValidationError = (error: any): object => {
  const message = Object.values(error.errors).join(", ");
  return new HttpException(400, message);
};

// handle invalid token
const handleInvalidToken = (): object =>
  new HttpException(401, "Invalid credential");
// handle expired token
const handleExpiredToken = (): object =>
  new HttpException(401, "your Credential has expired. Please login again");

function errorMiddleware(
  err: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error: any = { ...err };
    error.message = err.message;
    error.name = err.name;

    if (error.name === "CastError") error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateError();
    if (error.name === "ValidationError") error = handleValidationError(error);
    if (error.name === "JsonWebTokenError") error = handleInvalidToken();
    if (error.name === "TokenExpiredError") error = handleExpiredToken();

    sendErrorProd(error, res);
  }
}

export default errorMiddleware;
