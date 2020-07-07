import { Request } from "express";
import User from "./user.interface";
import { TransportOptions } from "nodemailer";

export interface TokenData {
  _id?: object;
  sendToken?(): string;
  comparePassword?(candidatePassword: string, userPassword: string): boolean;
  checkpassword?(jwtTimestamp: number): boolean;
  sendResetToken?(): string;
  save?(validate: { validateBeforeSave: boolean }): void;
}

export interface LoginData {
  password: string;
  email: string;
}

export interface DataStoredInToken {
  _id: string;
}

export interface RequestWithUser extends Request {
  user: User;
}

export interface DecodeData {
  id: string;
  iat: number;
  exp: number;
}

export interface EmailData {
  sendTransport(): object;
  send(subject: string, template: string): Promise<void>;
  sendWelcome(): Promise<void>;
  passwordReset(): Promise<void>;
}

export interface TransportEmail extends TransportOptions {
  service?: string;
}
