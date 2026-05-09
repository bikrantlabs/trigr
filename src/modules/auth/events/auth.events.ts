import { TypedEventEmitter } from "src/shared/infra/events/event-emitter";

export type AuthEventMap = {
  "user.verification_code": [{ email: string; code: string }];
  "user.logged_in": [
    { userId: string; email: string; ipAddress: string | null },
  ];
  "user.logged_out": [{ userId: string }];
  "user.token_refreshed": [{ userId: string }];
  "user.verified": [{ userId: string; email: string; code: string }];
};

export const authEvents = new TypedEventEmitter<AuthEventMap>();
