import { NextFunction, Response, Request } from "express";
import HttpException from "../exceptions/HttpException";
import { RequestWithUser } from "../interface/auth.interface";

export default (...roles: string[]) => {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new HttpException(401, "You are not authorize to perform this action")
      );
    }
    next();
  };
};
