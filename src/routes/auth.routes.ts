import { Router } from "express";
import Route from "../interface/routes.interface";
import AuthController from "../controllers/auth.controller";

class AuthRoute implements Route {
  public path = "/auth";
  public router = Router();
  public AuthController = new AuthController();

  constructor() {
    this.initializeRoute();
  }

  public initializeRoute() {
    this.router.post(`${this.path}/register`, this.AuthController.register);
    this.router.post(`${this.path}/login`, this.AuthController.login);
    this.router.patch(
      `${this.path}/forgotPassword`,
      this.AuthController.forgotPassword
    );
  }
}

export default AuthRoute;
