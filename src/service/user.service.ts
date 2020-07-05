import HttpException from "../exceptions/HttpException";
import User from "../interface/user.interface";
import UserModel from "../models/user.model";

class UserService {
  public users = UserModel;

  public async findAllUsers(): Promise<User[]> {
    const users: User[] = await this.users.find();
    return users;
  }

  public async findUserById(userId: string): Promise<User> {
    const user: User = await this.users.findById(userId);

    if (!user) throw new HttpException(400, "no user found");
    return user;
  }

  public async deleteUser(userId: string): Promise<void> {
    const user: User = await this.users.findById(userId);
    if (!user) throw new HttpException(404, "user not found");
    await this.users.findByIdAndRemove(userId);
  }
}

export default UserService;
