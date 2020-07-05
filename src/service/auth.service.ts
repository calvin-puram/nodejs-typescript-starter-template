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
    if (isEmptyObject(userData))
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
}

export default AuthService;
