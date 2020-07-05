import { Router } from "express";
import Route from "../interface/routes.interface";
import AuthController from "../controllers/auth.controller";
import protect from "../middleware/auth.middleware";

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

    this.router.patch(
      `${this.path}/resetPassword/:token`,
      this.AuthController.resetPassword
    );

    this.router.get(`${this.path}/getMe`, protect, this.AuthController.getMe);
    this.router.patch(
      `${this.path}/updateMe/:id`,
      protect,
      this.AuthController.updateDetails
    );

    this.router.patch(
      `${this.path}/updatePassword/:id`,
      protect,
      this.AuthController.updatePassword
    );

    this.router.get(`${this.path}/logout`, this.AuthController.logout);
  }
}

export default AuthRoute;
