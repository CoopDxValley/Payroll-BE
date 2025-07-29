import passport from "passport";
import prisma from "../client";
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  VerifyCallback,
} from "passport-jwt";
import config from "./config";
import { TokenType } from "@prisma/client";

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify: VerifyCallback = async (payload, done) => {
  try {
    if (payload.type !== TokenType.ACCESS) {
      return done(new Error("Invalid token type"), false);
    }

    const user = await prisma.employee.findFirst({
      where: { id: payload.sub.employeeId },
      include: {
        roleHistory: {
          where: { toDate: null },
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
        departmentHistory: {
          where: { toDate: null },
          include: {
            department: true,
          },
        },
      },
    });

    if (!user) {
      return done(null, false);
    }

    const permissions = new Set<string>();

    user.roleHistory.forEach((employeeRole) => {
      employeeRole.role.permissions.forEach((rp) => {
        permissions.add(`${rp.permission.action}_${rp.permission.subject}`);
      });
    });

    const authUser = {
      id: user.id,
      name: user.name,
      isSuperAdmin: user.isSuperAdmin,
      companyId: user.companyId,
      departmentId: user.departmentHistory[0]?.department.id || "",
      roles: user.roleHistory.map((ur) => ur.role.name),
      permissions: Array.from(permissions),
    };

    done(null, authUser);
  } catch (error) {
    done(error, false);
  }
};

// ✅ Register the strategy
passport.use(new JwtStrategy(jwtOptions, jwtVerify));

// ✅ Export passport instance for initialization
// export default passport;
export const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
