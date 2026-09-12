import { Request, Response, NextFunction } from "express";

export const authorize = (roles: ("ADMIN" | "CUSTOMER")[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
      return;
    }
    next();
  };
};
