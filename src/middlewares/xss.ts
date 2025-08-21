import { Request, Response, NextFunction } from "express";
import xss from "xss";

// Sanitize only strings
const clean = (data: any): any => {
  if (typeof data === "string") {
    return xss(data);
  } else if (Array.isArray(data)) {
    return data.map(clean);
  } else if (data !== null && typeof data === "object") {
    return sanitizeObject(data);
  }
  return data; // numbers, booleans, null, undefined stay as they are
};

// Sanitize all keys in an object
const sanitizeObject = (obj: Record<string, any>) => {
  for (const key of Object.keys(obj)) {
    obj[key] = clean(obj[key]);
  }
  return obj;
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
