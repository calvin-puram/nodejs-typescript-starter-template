import { Request, Response, NextFunction } from "express";

export default (fn: any) => {
  return (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
};
