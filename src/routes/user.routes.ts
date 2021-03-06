import { Router } from "express";
import Route from "../interface/routes.interface";
import UserController from "../controllers/user.controller";
import protect from "../middleware/auth.middleware";

class UserRoute implements Route {
  public path = "/user";
  public router = Router();
  public UserController = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(`${this.path}s`, protect, this.UserController.getAllUsers);

    this.router
      .route(`${this.path}/:id`)
      .get(protect, this.UserController.getUser)
      .delete(protect, this.UserController.deleteUser);
  }
}

export default UserRoute;
