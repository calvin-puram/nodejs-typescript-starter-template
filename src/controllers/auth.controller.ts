import { NextFunction, Response, Request } from "express";
import User from "../interface/user.interface";
import AuthService from "../service/auth.service";
import userModel from "../models/user.model";
import catchAsync from "../utils/catchAsync";
import { LoginData, RequestWithUser } from "../interface/auth.interface";
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

      const url: string =
        process.env.NODE_ENV === "development"
          ? "http://localhost:4000/"
          : "https://domain.com/home";

      await new SendEmail(user, url).sendWelcome();

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

  public resetPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const hashToken: string = req.params.token;
      const { password, confirmPassword } = req.body;
      const user = await this.AuthService.resetPassword(hashToken);

      try {
        if (!password || !confirmPassword) {
          return next(new HttpException(400, "all fields are required"));
        }
        if (password !== confirmPassword) {
          return next(new HttpException(400, "Password do not match"));
        }
        user.password = req.body.password;
        user.confirmPassword = req.body.confirmPassword;
        user.forgetPasswordResetToken = undefined;
        user.forgetPasswordExpires = undefined;
        await user.save();

        this.setToken(user, res, 200);
      } catch (err) {
        logger.error(err.message);
      }
    }
  );

  public getMe = catchAsync(
    async (req: RequestWithUser, res: Response, next: NextFunction) => {
      const userId: object = req.user.id;
      const user: User = await this.AuthService.getMe(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    }
  );

  public updateDetails = catchAsync(
    async (req: RequestWithUser, res: Response, next: NextFunction) => {
      const id: string = req.params.id;
      const userData: { name: string; email: string } = req.body;
      if (req.body.password) {
        return res.status(400).json({
          success: false,
          msg: "you can only update name and email in this route",
        });
      }

      const user = await this.AuthService.updateDetails(userData, id);

      this.setToken(user, res, 200);
    }
  );

  public updatePassword = catchAsync(
    async (req: RequestWithUser, res: Response, next: NextFunction) => {
      const userData: {
        newPass: string;
        currPass: string;
        confirmPass: string;
      } = req.body;
      const id: object = req.user.id;

      const user: User = await this.AuthService.updatePassword(userData, id);

      user.password = userData.newPass;
      user.confirmPassword = userData.confirmPass;
      await user.save({ validateBeforeSave: true });

      this.setToken(user, res, 200);
    }
  );

  public logout = catchAsync(
    async (req: RequestWithUser, res: Response, next: NextFunction) => {
      res.cookie("token", "none", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
      });

      res.status(200).json({
        success: true,
        data: {},
      });
    }
  );
}

export default AuthController;
