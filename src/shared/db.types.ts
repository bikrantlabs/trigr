// db.types.ts

export type DbTimestamp = string;

export type DbUser = {
  id: string; // UUID
  email: string;
  password_hash: string;
  is_email_verified: boolean;
  is_active: boolean;
  created_at: DbTimestamp;
  updated_at: DbTimestamp;
};

export type DbRefreshToken = {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: DbTimestamp;
  created_at: DbTimestamp;
  revoked_at: DbTimestamp | null;
  user_agent: string | null;
  ip_address: string | null;
};

export type DbRefreshTokenWithUser = {
  user?: DbUser;
} & DbRefreshToken;
