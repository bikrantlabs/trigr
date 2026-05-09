// ─── Domain types ─────────────────────────────────────────────────────────────

import { LoginBody, RegisterBody } from "./validators/auth.validator";

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type RefreshToken = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt: Date | null;
  userAgent: string | null;
  ipAddress: string | null;
};

export type Meta = {
  userAgent: string | null;
  ipAddress: string | null;
};
// ─── Service input types are defined inside /validators ───────────────────────────────────────────────

// ─── Service output types ───────────────────────────────────────────────

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResult = {
  user: PublicUser;
  tokens: TokenPair;
};

// ─── API Responses  ────────────────────────────────────────────────────────
export type RegisterResponse = Omit<AuthResult, "tokens">;
export type LoginResponse = AuthResult;
export type RefreshResponse = TokenPair;
export type GetMeResponse = { user: PublicUser };

// ─── JWT payload types ────────────────────────────────────────────────────────

export type AccessTokenPayload = {
  sub: string; // userId
  email: string;
  type: "access";
  iat: number;
  exp: number;
};

export type RefreshTokenPayload = {
  sub: string; // userId
  jti: string; // JWT Token Id — stored in DB, used for revocation
  type: "refresh";
  iat: number;
  exp: number;
};

// ─── Public user shape ────────────────────────────────────────────────────────

export type PublicUser = Omit<User, "passwordHash">;

// ─── Repository types ────────────────────────────────────────────────────

export type UserRepository = {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  setEmailVerified(userId: string, verified: boolean): Promise<User>;
  // updateById(id: string, data: Partial<User>): Promise<User>;
  // deleteById(id: string): Promise<void>;
};

export type TokenRepository = {
  create(data: CreateTokenData): Promise<void>;
  findById(id: string): Promise<RefreshToken | null>;
  revokeById(id: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
  delete(id: string): Promise<void>;
  deleteExpired(): Promise<void>; // Returns count of deleted tokens
};

// ─── Repository data types ────────────────────────────────────────────────────

export type CreateUserData = {
  email: string;
  passwordHash: string;
};

export type CreateTokenData = {
  id: string; // jti from JWT
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  userAgent: string | null;
  ipAddress: string | null;
};

// ─── Future: OAuth ────────────────────────────────────────────────────────────

export type OAuthProfile = {
  provider: "google" | "github" | "discord";
  providerId: string;
  email: string;
  name: string;
  avatarUrl?: string;
};

// ─── Services ────────────────────────────────────────────────────────────

export type TokenService = {
  generateAccessToken(userId: string, email: string): string;
  generateRefreshToken(userId: string): { token: string; jti: string };
  verifyAccessToken(token: string): AccessTokenPayload;
  verifyRefreshTokenSignature(token: string): RefreshTokenPayload;
  persistRefreshToken(data: {
    jti: string;
    userId: string;
    rawToken: string;
    meta: Meta;
  }): Promise<void>;
  validateRefreshToken(rawToken: string): Promise<RefreshTokenPayload>;
  rotateRefreshToken(data: {
    oldJti: string;
    userId: string;
    email: string;
    meta: Meta;
  }): Promise<TokenPair>;
  revokeToken(jti: string): Promise<void>;
  revokeAllUserTokens(userId: string): Promise<void>;
};

export type AuthService = {
  register(data: RegisterBody): Promise<PublicUser>;
  verify(
    data: { userId: string; code: string },
    meta: Meta,
  ): Promise<AuthResult>;
  login(data: LoginBody, meta: Meta): Promise<AuthResult>;
  sendVerificationEmail(data: { email: string; code: string }): Promise<void>;

  refresh(rawRefreshToken: string, meta: Meta): Promise<TokenPair>;

  logout(rawRefreshToken: string): Promise<void>;

  getMe(userId: string): Promise<PublicUser>;
};
