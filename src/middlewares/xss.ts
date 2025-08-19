import { Request, Response, NextFunction } from "express";
import xss from "xss";

const clean = (data: any) => {
  if (typeof data === "object") {
    return JSON.parse(xss(JSON.stringify(data)));
  }
  return xss(String(data));
};

const middleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body) req.body = clean(req.body);
    if (req.query) req.query = clean(req.query);
    if (req.params) req.params = clean(req.params);
    next();
  };
};

export default middleware;
