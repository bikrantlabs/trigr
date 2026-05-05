import jwt from "jsonwebtoken";
import { UserEntity } from "src/modules/auth/auth.types";

export const signRefreshToken = (userId: UserEntity["id"]) => {
  const REFRESH_TOKEN_SECRET =
    process.env.REFRESH_TOKEN_SECRET ??
    (() => {
      throw new Error("REFRESH_TOKEN_SECRET missing");
    })();
  return jwt.sign({ sub: userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
    algorithm: "HS256",
    issuer: "trigr",
  });
};

export const signAccessToken = (data: {
  userId: UserEntity["id"];
  email: string;
}) => {
  const ACCESS_TOKEN_SECRET =
    process.env.ACCESS_TOKEN_SECRET ??
    (() => {
      throw new Error("ACCESS_TOKEN_SECRET missing");
    })();
  return jwt.sign({ sub: data.userId, email: data.email }, ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
    algorithm: "HS256",
    issuer: "trigr",
  });
};
