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
    const sanitized: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      sanitized[key] = clean(data[key]);
    }
    return sanitized;
  }

  // numbers, booleans, null, undefined stay as they are
  return data;
};

const middleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === "object") {
      req.body = clean(req.body);
    }
    if (req.query && typeof req.query === "object") {
      req.query = clean(req.query);
    }
    if (req.params && typeof req.params === "object") {
      req.params = clean(req.params);
    }
    next();
  };
};

export default middleware;
