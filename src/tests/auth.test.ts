import { LoginData } from "./../interface/auth.interface";
import * as request from "supertest";
import * as mongoose from "mongoose";
import Users from "../models/user.model";
import User from "../interface/user.interface";
import App from "../app";
import AuthRoute from "../routes/auth.routes";
import * as nodemailer from "nodemailer";

const authRoute = new AuthRoute();
const app = new App([authRoute]);

const sendMailMock = jest.fn().mockReturnValue("reset link sent successfully");
jest.mock("nodemailer");

// @ts-ignore: Unreachable code error
nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

describe("The auth route", () => {
  let resetLink: string;
  let userData: User = {
    _id: mongoose.Types.ObjectId(),
    name: "calvin",
    email: "xyz@gmail.com",
    password: "2begood4",
    confirmPassword: "2begood4",
  };
  let token: string;

  beforeAll(() => {
    sendMailMock.mockClear();
    // @ts-ignore: Unreachable code error
    nodemailer.createTransport.mockClear();
  });

  afterAll(async () => {
    await Users.deleteMany({ name: "calvin" });
    await mongoose.connection.close();
  });

  it("should register a users", async () => {
    const res = await request(app.getServer())
      .post(`${authRoute.path}/register`)
      .send(userData);

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.token).toBeDefined();
  });

  it("should login a user", async () => {
    const data: LoginData = { email: "xyz@gmail.com", password: "2begood4" };
    const res = await request(app.getServer())
      .post(`${authRoute.path}/login`)
      .send(data);

    token = res.body.token;
    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.token).toBeDefined();
  });

  it("should get loggedin user", async () => {
    const res = await request(app.getServer())
      .get(`${authRoute.path}/getMe`)
      .set("authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.data.email).toBe("xyz@gmail.com");
  });

  it("should update loggedIn user details", async () => {
    const updateDetails = { email: "pjc4u@gmail.com" };
    const res = await request(app.getServer())
      .patch(`${authRoute.path}/updateMe/${userData._id}`)
      .set("authorization", `Bearer ${token}`)
      .send(updateDetails);

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.token).toBeDefined();
  });

  it("should throw error if user want to update password in this route", async () => {
    const updateDetails = { email: "pjc4u@gmail.com", password: "liv2lovv" };
    const res = await request(app.getServer())
      .patch(`${authRoute.path}/updateMe/${userData._id}`)
      .set("authorization", `Bearer ${token}`)
      .send(updateDetails);

    expect(res.status).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.msg).toBe(
      "you can only update name and email in this route"
    );
  });

  it("should update loggedIn user password", async () => {
    const updateDetails = {
      newPass: "liv2lov",
      currPass: "2begood4",
      confirmPass: "liv2lov",
    };

    const res = await request(app.getServer())
      .patch(`${authRoute.path}/updatePassword/${userData._id}`)
      .set("authorization", `Bearer ${token}`)
      .send(updateDetails);

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.token).toBeDefined();
  });

  it("should send password reset link to user email", async () => {
    const res = await request(app.getServer())
      .patch(`${authRoute.path}/forgotPassword`)
      .send({ email: "pjc4u@gmail.com" });

    expect(sendMailMock).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.data).toBe("reset password email sent successfully");

    const newUser = await Users.findById(userData._id);

    expect(newUser.forgetPasswordExpires).toBeDefined();
    expect(newUser.forgetPasswordResetToken).toBeDefined();

    resetLink = newUser.forgetPasswordResetToken;
  });

  it("should reset user password", async () => {
    const res = await request(app.getServer())
      .patch(`${authRoute.path}/resetPassword/${resetLink}`)
      .send({ password: "2begood4", confirmPassword: "2begood4" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.token).toBeDefined();

    const newUser = await Users.findById(userData._id);

    expect(newUser.forgetPasswordExpires).toBeUndefined();
    expect(newUser.forgetPasswordResetToken).toBeUndefined();
  });
  it("should logout user", async () => {
    const res = await request(app.getServer()).get(`${authRoute.path}/logout`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
  });
});
