import { NextFunction, Request, Response } from "express";
import UserService from "../service/user.service";
import User from "../interface/user.interface";
import catchAsync from "../utils/catchAsync";

class UserController {
  public UserService = new UserService();

  public getAllUsers = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const users: User[] = await this.UserService.findAllUsers();
      res.status(200).json({
        success: true,
        data: users,
      });
    }
  );

  public getUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId: string = req.params.id;
      const user: User = await this.UserService.findUserById(userId);
      res.status(200).json({
        success: true,
        data: user,
      });
    }
  );

  public deleteUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId: string = req.params.id;
      await this.UserService.deleteUser(userId);
      res.status(200).json({
        success: true,
        data: null,
      });
    }
  );
}

export default UserController;
