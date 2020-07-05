import { Router } from "express";
import Route from "../interface/routes.interface";
import IndexController from "../controllers/index.controller";

class IndexRoute implements Route {
  public path = "/";
  public router = Router();
  public IndexController = new IndexController();

  constructor() {
    this.initializedRoute();
  }

  private initializedRoute() {
    this.router.get(`${this.path}`, this.IndexController.index);
  }
}

export default IndexRoute;
