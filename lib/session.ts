export interface SessionOptions {
  password: string;
  cookieName: string;
  cookieOptions: {
    secure: boolean;
  };
}

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    "complex_password_at_least_32_characters_long",
  cookieName: "mightyshare_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};
