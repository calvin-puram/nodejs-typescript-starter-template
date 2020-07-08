import * as request from "supertest";
import * as mongoose from "mongoose";
import Users from "../models/user.model";
import User from "../interface/user.interface";
import App from "../app";
import UserRoute from "../routes/user.routes";
import HttpException from "../exceptions/HttpException";

const userRoute = new UserRoute();
const app = new App([userRoute]);
describe("Testing Users", () => {
  let userData: User = {
    _id: mongoose.Types.ObjectId(),
    name: "calvin",
    email: "xyz@gmail.com",
    password: "2begood4",
    confirmPassword: "2begood4",
  };
  let user: User;
  beforeAll(async () => {
    user = await Users.create(userData);
  });

  afterAll(async () => {
    await Users.deleteOne({ name: "calvin" });
    await mongoose.connection.close();
  });

  describe("[GET] /users", () => {
    it("should get all the users", async () => {
      const res = await request(app.getServer()).get(`${userRoute.path}s`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBeTruthy();
    });
  });

  describe("[GET] /user", () => {
    it("should get a single user", async () => {
      const res = await request(app.getServer()).get(
        `${userRoute.path}/${user._id}`
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBeTruthy();
    });
  });

  describe("[DELETE] /user/:id", () => {
    it("should delete a user", async () => {
      const res = await request(app.getServer()).get(
        `${userRoute.path}/${user._id}`
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBeTruthy();
    });
  });
});
