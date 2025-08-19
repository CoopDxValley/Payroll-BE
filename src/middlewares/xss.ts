import { Request, Response, NextFunction } from "express";
import xss from "xss";

// Sanitize a single value
const clean = (data: any) => {
  if (typeof data === "object") {
    return JSON.parse(xss(JSON.stringify(data)));
  }
  return xss(String(data));
};

// Sanitize all keys in an object
const sanitizeObject = (obj: Record<string, any>) => {
  for (const key of Object.keys(obj)) {
    obj[key] = clean(obj[key]);
  }
};

const middleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === "object") {
      sanitizeObject(req.body);
    }
    if (req.query && typeof req.query === "object") {
      sanitizeObject(req.query);
    }
    if (req.params && typeof req.params === "object") {
      sanitizeObject(req.params);
    }
    next();
  };
};

export default middleware;
