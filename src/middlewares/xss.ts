import { Request, Response, NextFunction } from "express";
import xss from "xss";

const clean = (data: any): any => {
  if (typeof data === "string") {
    return xss(data);
  }

  if (Array.isArray(data)) {
    return data.map((item) => clean(item));
  }

  if (data !== null && typeof data === "object") {
    for (const key of Object.keys(data)) {
      data[key] = clean(data[key]);
    }
    return data;
  }

  // numbers, booleans, null, undefined stay as they are
  return data;
};

const middleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === "object") {
      req.body = clean(req.body); // safe to reassign
    }
    if (req.query && typeof req.query === "object") {
      clean(req.query); // mutate in place
    }
    if (req.params && typeof req.params === "object") {
      clean(req.params); // mutate in place
    }
    next();
  };
};

export default middleware;
