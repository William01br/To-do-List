import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { MockStrategy } from "passport-mock-strategy";

// for test environment
if (process.env.NODE_ENV === "test") {
  passport.use(
    new MockStrategy(
      {
        name: "google",
        user: {
          id: "12345",
          displayName: "Test User",
          emails: [{ value: "test@example.com" }],
          photos: [{ value: "url" }],
        },
      },
      (user, done) => {
        return done(null, user);
      }
    )
  );
} else {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback",
      },
      (acessToken, refreshToken, profile, done) => {
        return done(null, profile);
      }
    )
  );
}

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});
