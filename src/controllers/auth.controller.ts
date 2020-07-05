import { NextFunction, Response, Request } from "express";
import User from "../interface/user.interface";
import AuthService from "../service/auth.service";
import userModel from "../models/user.model";
import catchAsync from "../utils/catchAsync";
import { LoginData } from "../interface/auth.interface";
import SendEmail from "../utils/email";
import logger from "../utils/logger";
import HttpException from "../exceptions/HttpException";

class AuthController {
  public AuthService = new AuthService();
  public user = userModel;

  private setToken = async function (
    user: User,
    res: Response,
    statusCode: number
  ) {
    const token: string = await user.sendToken();

    const cookieOptions: {
      httpOnly: boolean;
      expires: Date;
      secure: boolean;
    } = {
      httpOnly: true,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      secure: false,
    };

    if (process.env.NODE_ENV === "production") {
      cookieOptions.secure = true;
    }

    user.password = undefined;

    res.cookie("token", token, cookieOptions).status(statusCode).json({
      success: true,
      token,
    });
  };

  public register = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userData: User = req.body;
      const user: User = await this.AuthService.register(userData);

      this.setToken(user, res, 200);
    }
  );

  public login = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userData: LoginData = req.body;
      const user = await this.AuthService.login(userData);
      this.setToken(user, res, 200);
    }
  );

  public forgotPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userData: { email: string } = req.body;
      const user = await this.AuthService.forgotPassword(userData);

      const resetToken = user.sendResetToken();
      await user.save({ validateBeforeSave: false });

      try {
        const replyUrl = `http://localhost:4000/auth/resetpassword/${resetToken}`;
        await new SendEmail(user, replyUrl).passwordReset();

        res.status(200).json({
          success: true,
          data: "reset password email sent successfully",
        });
      } catch (err) {
        logger.error(err.message);
        user.forgetPasswordResetToken = undefined;
        user.forgetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
          new HttpException(500, "your email could not be sent. try again")
        );
      }
    }
  );
}

export default AuthController;
