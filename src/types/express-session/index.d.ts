import 'express-session';

declare module 'express-session' {
  interface Session {
    user_id?: number;
    kakaoToken?: string;
  }
}