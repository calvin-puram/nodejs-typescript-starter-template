import * as crypto from "crypto";
import { isEmptyObject } from "../utils/checkObject";
import userModel from "../models/user.model";
import User from "../interface/user.interface";
import HttpException from "../exceptions/HttpException";
import { LoginData } from "../interface/auth.interface";

class AuthService {
  public users = userModel;

  public register = async (userData: User): Promise<User> => {
    if (isEmptyObject(userData)) {
      throw new HttpException(400, "all fields are required!");
    }

    const user: User = await this.users.findOne({ email: userData.email });

    if (user) {
      throw new HttpException(
        409,
        `your email: ${userData.email} already exist`
      );
    }

    const registeredUser = await this.users.create(userData);
    return registeredUser;
  };

  public login = async (userData: LoginData): Promise<User> => {
    if (!userData.email || !userData.password)
      throw new HttpException(400, "all fields are required!");

    const user: User = await this.users
      .findOne({ email: userData.email })
      .select("+password");
    if (
      !user ||
      !(await user.comparePassword(userData.password, user.password))
    ) {
      throw new HttpException(401, `invalid credentials`);
    }

    return user;
  };

  public forgotPassword = async (userData: { email: string }) => {
    if (isEmptyObject(userData)) {
      throw new HttpException(400, "email  is required");
    }
    const user: User = await this.users.findOne({ email: userData.email });
    if (!user) {
      throw new HttpException(
        404,
        "this email is not registered on this platform"
      );
    }
    return user;
  };

  public resetPassword = async (hashToken: string) => {
    const hashedToken = crypto
      .createHash("sha256")
      .update(hashToken)
      .digest("hex");

    const currentdate: any = Date.now();
    const user = await this.users.findOne({
      forgetPasswordResetToken: hashedToken,
      forgetPasswordExpires: { $gte: currentdate },
    });

    if (!user) {
      throw new HttpException(400, "Invalid Token or Token has Expired");
    }

    return user;
  };

  public getMe = async (userId: string) => {
    const user: User = await this.users.findById(userId);
    return user;
  };

  public updateDetails = async (
    userData: { name: string; email: string },
    id: string
  ) => {
    if (isEmptyObject(userData)) {
      throw new HttpException(400, "all fields  are required");
    }

    const user = await this.users.findByIdAndUpdate(id, userData, {
      new: true,
      runValidators: true,
    });

    return user;
  };

  public updatePassword = async (
    userData: { newPass: string; currPass: string; confirmPass: string },
    id: object
  ) => {
    if (!userData.newPass || !userData.currPass || !userData.confirmPass) {
      throw new HttpException(400, "all fields are required!");
    }

    if (userData.newPass !== userData.confirmPass) {
      throw new HttpException(400, "Password do not match!");
    }

    const user: User = await this.users.findById(id).select("+password");

    if (!(await user.comparePassword(userData.currPass, user.password))) {
      throw new HttpException(400, "invalid credentials!");
    }
    return user;
  };
}

export default AuthService;
