import { TokenData } from "./auth.interface";

interface User extends TokenData {
  _id?: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
  passwordChangeAt?: number;
  createdAt?: Date;
}

export default User;
