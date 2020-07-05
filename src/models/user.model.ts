import * as mongoose from "mongoose";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import User from "../interface/user.interface";
import validator from "validator";
import * as crypto from "crypto";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
    validate: [validator.isEmail, "invalid Email"],
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "password is required"],
    minlength: 6,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "please confirm your password"],
    validate: {
      validator: function (val: string) {
        return val === this.password;
      },
      message: "password do not match",
    },
  },
  role: {
    type: String,
    default: "user",
  },
  passwordChangeAt: Date,
  forgetPasswordResetToken: String,
  forgetPasswordExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// hash password
UserSchema.pre<User & mongoose.Document>("save", async function (
  next
): Promise<void> {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  this.confirmPassword = undefined;

  next();
});

// send jwt to user
UserSchema.methods.sendToken = async function (): Promise<string> {
  const token = await jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

  return token;
};

//set password change time
UserSchema.pre<User & mongoose.Document>("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangeAt = Date.now() - 1000;
  next();
});

//check password
UserSchema.methods.checkpassword = function (jwtTimestamp: number): boolean {
  if (this.passwordChangeAt) {
    const convert = `${this.passwordChangeAt.getTime() / 1000}`;
    const convertTime = parseInt(convert, 10);
    console.log(jwtTimestamp, convertTime);
    return jwtTimestamp < convertTime;
  }
  return false;
};

// compare password
UserSchema.methods.comparePassword = async (
  candidatePassword: string,
  userPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// send reset token
UserSchema.methods.sendResetToken = function (): string {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.forgetPasswordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.forgetPasswordExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const UserModel = mongoose.model<User & mongoose.Document>("Users", UserSchema);
export default UserModel;
