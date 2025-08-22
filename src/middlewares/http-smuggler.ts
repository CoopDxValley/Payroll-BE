import { Request, Response, NextFunction } from "express";

const httpSmugglingMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.headers["content-length"] && req.headers["transfer-encoding"]) {
      console.log("---- oh no");
      throw new Error("HTTP Request Smuggling Attempt Detected");
    }
    // next();
  };
};

export default httpSmugglingMiddleware;
