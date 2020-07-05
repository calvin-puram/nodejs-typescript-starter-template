import { NextFunction, Response } from "express";
import * as jwt from "jsonwebtoken";
import HttpException from "../exceptions/HttpException";
import Users from "../models/user.model";
import User from "../interface/user.interface";
import { RequestWithUser } from "../interface/auth.interface";
import catchAsync from "../utils/catchAsync";

export default catchAsync(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    let token: string;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new HttpException(401, "you are not logged in"));
    }

    const decode:
      | { id: string; iat: number; exp: number }
      | any = await jwt.verify(token, process.env.JWT_SECRET);

    // check if user exist
    const currentUser: User = await Users.findById(decode.id).select(
      "+password"
    );
    console.log(decode);

    if (!currentUser) {
      return next(new HttpException(401, "user no longer exist"));
    }

    if (currentUser.checkpassword(decode.iat)) {
      return next(
        new HttpException(
          401,
          "this user recently changed his password. login again"
        )
      );
    }

    req.user = currentUser;
    next();
  }
);
