import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";

class IndexController {
  public index = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      res.status(200).json({
        success: true,
        data: "home route",
      });
    }
  );
}

export default IndexController;
