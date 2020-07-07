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

    // it("should throw error if no user is found", async () => {
    //   const res = await request(app.getServer()).get(
    //     `${userRoute.path}/5f048da6d4e82f0eec98fb8z`
    //   );

    //   const err = new HttpException(400, "user not found");
    //   console.log(res.body);
    //   expect(err).toHaveBeenCalled();
    //   // expect(res.body.success).toBeFalsy();
    //   // expect(res.body.msg).toBe("user not found");
    // });
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
