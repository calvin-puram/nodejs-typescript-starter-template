import { TokenData } from "./auth.interface";

interface User extends TokenData {
  id?: object;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
  passwordChangeAt?: number;
  forgetPasswordResetToken?: string;
  forgetPasswordExpires?: Date;
  createdAt?: Date;
}

export default User;
