import { NextFunction } from "express";
import Users from "../../../models/user.model";
import * as mongoose from "mongoose";
import protect from "../../../middleware/auth.middleware";
import User from "../../../interface/user.interface";
import App from "../../../app";
import AuthRoute from "../../../routes/auth.routes";

const authRoute = new AuthRoute();
const app = new App([authRoute]);

class Response {
  status(status: any) {
    this.status = status;
    return this;
  }

  json(data: any) {
    return data;
  }
}

describe("The Auth Middleware", () => {
  let userData: User = {
    _id: mongoose.Types.ObjectId(),
    name: "calvin",
    email: "xyz@gmail.com",
    password: "2begood4",
    confirmPassword: "2begood4",
  };
  let user: User;

  beforeAll(async () => {
    user = await authRoute.AuthController.AuthService.users.create(userData);
  });

  afterAll(async () => {
    await Users.deleteOne({ name: "calvin" });
    await mongoose.connection.close();
  });
  it("should verify the auth token", async () => {
    const token: string = await user.sendToken();

    const req: any = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };

    const res: any = new Response();
    const next: NextFunction = jest.fn();
    await protect(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
  });

  it("should throw if no token", async () => {
    const token: string = "";

    const req: any = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };

    const res: any = new Response();
    const statusSpy = jest.spyOn(res, "status");
    const jsonSpy = jest.spyOn(res, "json");
    const next: NextFunction = jest.fn();

    await protect(req, res, next);

    expect(statusSpy).toHaveBeenCalledWith(401);
    expect(jsonSpy).toHaveBeenCalledWith({
      success: false,
      msg: "you are not logged in",
    });
  });

  it("should throw if user no longer exist", async () => {
    await Users.deleteOne({ name: "calvin" });
    const token: string = await user.sendToken();

    const req: any = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };

    const res: any = new Response();
    const statusSpy = jest.spyOn(res, "status");
    const jsonSpy = jest.spyOn(res, "json");
    const next: NextFunction = jest.fn();

    await protect(req, res, next);

    expect(statusSpy).toHaveBeenCalledWith(401);
    expect(jsonSpy).toHaveBeenCalledWith({
      success: false,
      msg: "user no longer exist",
    });
  });
});
